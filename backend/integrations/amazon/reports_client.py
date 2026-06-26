"""
Cliente Amazon SP-API — Reports API
=====================================

Genera y descarga el reporte GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA,
que contiene el inventario FBA completo con el SKU actual (no el del
warehouse), ASIN y cantidades desglosadas.

Flujo
-----
1. POST /reports/2021-06-30/reports          → reportId
2. GET  /reports/2021-06-30/reports/{id}     → polling hasta DONE
3. GET  /reports/2021-06-30/documents/{id}   → URL de descarga
4. GET  {url}                                → TSV comprimido (gzip)
"""

import csv
import gzip
import io
import time
from datetime import datetime, timezone

import httpx

from core.config import get_settings

_LWA_TOKEN_URL = "https://api.amazon.com/auth/o2/token"
_SP_API_BASE = "https://sellingpartnerapi-na.amazon.com"
_REPORT_TYPE = "GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA"
_POLL_INTERVAL_SEG = 10
_POLL_MAX_INTENTOS = 30  # 5 minutos máximo


class AmazonApiError(Exception):
    pass


def _obtener_access_token() -> str:
    settings = get_settings()
    if not settings.amazon_client_id:
        raise AmazonApiError("Credenciales de Amazon no configuradas en backend/.env")

    resp = httpx.post(
        _LWA_TOKEN_URL,
        data={
            "grant_type": "refresh_token",
            "refresh_token": settings.amazon_refresh_token,
            "client_id": settings.amazon_client_id,
            "client_secret": settings.amazon_client_secret,
            "amazon_marketplace_id": settings.amazon_marketplace_id,
        },
        timeout=15,
    )
    if resp.status_code != 200:
        raise AmazonApiError(f"Error al obtener access_token: {resp.status_code} {resp.text}")

    return resp.json()["access_token"]


def _buscar_reporte_de_hoy(token: str) -> str | None:
    """
    Retorna el reportId de un reporte del día actual (UTC), si existe uno
    DONE, IN_QUEUE o IN_PROGRESS. Si no, retorna None para que se cree uno nuevo.
    """
    resp = httpx.get(
        f"{_SP_API_BASE}/reports/2021-06-30/reports",
        headers={"x-amz-access-token": token},
        params={"reportTypes": _REPORT_TYPE, "pageSize": 10},
        timeout=15,
    )
    if resp.status_code != 200:
        return None

    hoy = datetime.now(timezone.utc).date().isoformat()

    # buscar reporte del dia actual dentro de todos los reportes
    for r in resp.json().get("reports", []):
        status = r.get("processingStatus")
        creado = r.get("createdTime", "")
        # si el reporte no esta en estado DONE, IN_QUEUE o IN_PROGRESS, continuar
        if status not in ("DONE", "IN_QUEUE", "IN_PROGRESS"):
            continue
        # si el reporte no fue creado el mismo dia, continuar
        if not creado.startswith(hoy):
            continue

        return r["reportId"]


def _crear_reporte(token: str, marketplace_id: str) -> str:
    # crear reporte
    resp = httpx.post(
        f"{_SP_API_BASE}/reports/2021-06-30/reports",
        headers={"x-amz-access-token": token, "Content-Type": "application/json"},
        json={
            "reportType": _REPORT_TYPE,
            "marketplaceIds": [marketplace_id],
        },
        timeout=30,
    )
    # si el reporte no se creo, lanzar error
    if resp.status_code not in (200, 202):
        raise AmazonApiError(f"Error al crear reporte: {resp.status_code} {resp.text}")
    return resp.json()["reportId"]


def _esperar_reporte(token: str, report_id: str) -> str:
    """Hace polling hasta que el reporte esté listo. Retorna reportDocumentId."""
    for intento in range(_POLL_MAX_INTENTOS):
        # consultar reporte
        resp = httpx.get(
            f"{_SP_API_BASE}/reports/2021-06-30/reports/{report_id}",
            headers={"x-amz-access-token": token},
            timeout=15,
        )
        # si el reporte no se consulta, lanzar error
        if resp.status_code != 200:
            raise AmazonApiError(f"Error consultando reporte: {resp.status_code} {resp.text}")

        data = resp.json()
        status = data.get("processingStatus")
        # si el reporte esta listo, retornar el reportDocumentId
        if status == "DONE":
            return data["reportDocumentId"]
        # si el reporte esta cancelado o fallido, lanzar error
        if status in ("CANCELLED", "FATAL"):
            raise AmazonApiError(f"Reporte fallido con estado: {status}\n{data}")

        time.sleep(_POLL_INTERVAL_SEG)

    raise AmazonApiError("Timeout: el reporte no estuvo listo en 5 minutos")


def _obtener_url_descarga(token: str, document_id: str) -> tuple[str, bool]:
    """Retorna (url, es_gzip)."""
    resp = httpx.get(
        f"{_SP_API_BASE}/reports/2021-06-30/documents/{document_id}",
        headers={"x-amz-access-token": token},
        timeout=15,
    )
    if resp.status_code != 200:
        raise AmazonApiError(f"Error obteniendo documento: {resp.status_code} {resp.text}")

    data = resp.json()
    es_gzip = data.get("compressionAlgorithm") == "GZIP"
    return data["url"], es_gzip


def _descargar_y_parsear(url: str, es_gzip: bool) -> list[dict]:
    resp = httpx.get(url, timeout=60)
    # si la descarga no es exitosa, lanzar error
    if resp.status_code != 200:
        raise AmazonApiError(f"Error descargando reporte: {resp.status_code}")

    # descomprimir contenido si es gzip
    contenido = resp.content
    if es_gzip:
        contenido = gzip.decompress(contenido)

    texto = contenido.decode("latin-1")
    reader = csv.DictReader(io.StringIO(texto), delimiter="\t")
    filas = list(reader)
    if not filas:
        # Diagnóstico: cuando llega vacío, muestra el inicio del payload crudo.
        print(f"[Amazon FBA] reporte vacío. bytes={len(contenido)} primeros 300 chars:\n{texto[:300]!r}")
    return filas


def _generar_reporte(token: str, marketplace_id: str, reusar: bool) -> list[dict]:
    report_id = _buscar_reporte_de_hoy(token) if reusar else None
    if not report_id:
        report_id = _crear_reporte(token, marketplace_id)
    document_id = _esperar_reporte(token, report_id)
    url, es_gzip = _obtener_url_descarga(token, document_id)
    return _descargar_y_parsear(url, es_gzip)


def obtener_reporte_inventario_fba(forzar_nuevo: bool = False) -> list[dict]:
    """
    Genera y descarga el reporte FBA completo.
    Retorna lista de filas como dicts (keys = columnas del TSV).

    Si forzar_nuevo=False y el reporte reusado viene vacío, hace un retry
    forzando uno nuevo (Amazon a veces deja DONE reportes con 0 filas).
    """
    settings = get_settings()
    token = _obtener_access_token()

    filas = _generar_reporte(token, settings.amazon_marketplace_id, reusar=not forzar_nuevo)
    if not filas and not forzar_nuevo:
        print("[Amazon FBA] reporte reusado vacío, pidiendo uno nuevo…")
        filas = _generar_reporte(token, settings.amazon_marketplace_id, reusar=False)
    return filas
