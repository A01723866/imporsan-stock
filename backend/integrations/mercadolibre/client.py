"""
Cliente Mercado Libre API
==========================

Lee el inventario en Full y lo retorna como {sku: stock}.

Flujo
-----
1. POST /oauth/token                       → access_token (vía refresh_token)
2. GET  /users/{id}/items/search           → item_ids (paginado),
                                             filtrando por logistic_type=fulfillment
3. GET  /items?ids=...                     → multiget en batches de 20,
                                             retorna attributes + variations + user_product_id
4. GET  /user-products/{upid}/stock        → stock distribuido por ubicación;
                                             nos quedamos con type=meli_facility

El SKU vive en el attribute `SELLER_SKU` (NO en `seller_custom_field`, que
MELI deprecó). En items con variaciones, cada variación tiene su propio
`SELLER_SKU` y su propio `user_product_id`.
"""

import httpx

from core.config import get_settings
from core.supabase import get_supabase

_TOKEN_URL = "https://api.mercadolibre.com/oauth/token"
_API_BASE = "https://api.mercadolibre.com"
_BATCH_SIZE = 20


class MeliApiError(Exception):
    pass


def _obtener_access_token() -> str:
    settings = get_settings()
    if not settings.meli_client_id:
        raise MeliApiError("Credenciales de MELI no configuradas en backend/.env")

    resp = httpx.post(
        _TOKEN_URL,
        data={
            "grant_type": "refresh_token",
            "client_id": settings.meli_client_id,
            "client_secret": settings.meli_client_secret,
            "refresh_token": settings.meli_refresh_token,
        },
        timeout=15,
    )

    if resp.status_code != 200:
        raise MeliApiError(f"Error obteniendo token: {resp.status_code} {resp.text}")

    return resp.json()["access_token"]


def _listar_items_full(token: str, user_id: str) -> list[str]:
    """Retorna todos los item_ids activos con logistic_type=fulfillment (Full)."""
    ids: list[str] = []
    offset = 0
    limit = 50


    while True:
        resp = httpx.get(
            f"{_API_BASE}/users/{user_id}/items/search",
            headers={"Authorization": f"Bearer {token}"},
            params={
                "logistic_type": "fulfillment",
                "offset": offset,
                "limit": limit,
            },
            timeout=30,
        )
        if resp.status_code != 200:
            raise MeliApiError(f"Error listando items: {resp.status_code} {resp.text}")

        data = resp.json()
        ids.extend(data.get("results", []))

        # si no hay mas items, salir del bucle
        total = data.get("paging", {}).get("total", 0)
        offset += limit
        if offset >= total:
            break

    return ids


def _obtener_detalles_items(token: str, item_ids: list[str]) -> list[dict]:
    """
    Multiget en batches de 20. Retorna lista con id, seller_custom_field
    y user_product_id por cada item.
    """
    detalles = []

    for i in range(0, len(item_ids), _BATCH_SIZE):
        batch = item_ids[i:i + _BATCH_SIZE]
        resp = httpx.get(
            f"{_API_BASE}/items",
            headers={"Authorization": f"Bearer {token}"},
            params={
                "ids": ",".join(batch),
                "attributes": "id,user_product_id,status,attributes,variations",
            },
            timeout=30,
        )
        if resp.status_code != 200:
            raise MeliApiError(f"Error multiget items: {resp.status_code} {resp.text}")

        for entry in resp.json():
            if entry.get("code") == 200:
                detalles.append(entry.get("body", {}))

    return detalles


def _obtener_stock_meli_facility(token: str, user_product_id: str) -> int:
    """
    Llama /user-products/{id}/stock y suma quantity de locations
    con type=meli_facility (lo que está físicamente en Full).
    """
    resp = httpx.get(
        f"{_API_BASE}/user-products/{user_product_id}/stock",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    if resp.status_code != 200:
        # un user_product sin stock distribuido devuelve 404; lo tratamos como 0
        return 0

    total = 0
    for loc in resp.json().get("locations", []):
        if loc.get("type") == "meli_facility":
            total += int(loc.get("quantity") or 0)
    return total


def _extraer_seller_sku(attributes: list[dict] | None) -> str | None:
    """Busca el attribute con id=SELLER_SKU y retorna su value_name."""
    for attr in attributes or []:
        if attr.get("id") == "SELLER_SKU":
            valor = (attr.get("value_name") or "").strip()
            return valor or None
    return None


def _nombre_variacion(variation: dict) -> str:
    """Arma 'X / Y' a partir de attribute_combinations[].value_name."""
    partes = [
        (comb.get("value_name") or "").strip()
        for comb in variation.get("attribute_combinations") or []
    ]
    return " / ".join(p for p in partes if p)


def _cargar_mapa_variaciones() -> dict[str, str]:
    """
    Lee la tabla mapa_meli_variaciones de Supabase y retorna {nombre: sku}.
    Las variaciones de MELI no traen SELLER_SKU, así que resolvemos su SKU
    por el nombre de la combinación de atributos.
    """
    resp = get_supabase().table("mapa_meli_variaciones").select("nombre,sku").execute()
    return {fila["nombre"]: fila["sku"] for fila in resp.data}


def _recorrer_publicaciones(detalles: list[dict], mapa_variaciones: dict[str, str]):
    """
    Genera tuplas (sku, user_product_id) por cada unidad de stock distinta:
    una por cada variación si el item tiene variations, o una sola
    a nivel item si no las tiene.

    Para variaciones sin SELLER_SKU, resuelve el SKU desde mapa_variaciones
    usando el nombre de la combinación de atributos.
    """
    for item in detalles:
        variations = item.get("variations") or []
        if variations:
            for var in variations:
                sku = _extraer_seller_sku(var.get("attributes"))
                if not sku:
                    sku = mapa_variaciones.get(_nombre_variacion(var))
                upid = var.get("user_product_id") or item.get("user_product_id")
                yield sku, upid
        else:
            sku = _extraer_seller_sku(item.get("attributes"))
            upid = item.get("user_product_id")
            yield sku, upid


def obtener_inventario_full() -> dict[str, int]:
    """
    Retorna { sku: stock_en_meli_facility }.
    Pares (sku, user_product_id) sin alguno de los dos se ignoran.
    """
    settings = get_settings()
    token = _obtener_access_token()

    item_ids = _listar_items_full(token, settings.meli_user_id)
    detalles = _obtener_detalles_items(token, item_ids)
    mapa_variaciones = _cargar_mapa_variaciones()

    inventario: dict[str, int] = {}
    stock_por_upid: dict[str, int] = {}      # cache para evitar calls duplicados
    ya_sumados: set[tuple[str, str]] = set()  # (sku, upid) ya contabilizado

    for sku, upid in _recorrer_publicaciones(detalles, mapa_variaciones):
        if not sku or not upid or (sku, upid) in ya_sumados:
            continue
        ya_sumados.add((sku, upid))

        if upid not in stock_por_upid:
            stock_por_upid[upid] = _obtener_stock_meli_facility(token, upid)

        inventario[sku] = inventario.get(sku, 0) + stock_por_upid[upid]

    return inventario
