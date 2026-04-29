"""
Lógica de negocio del módulo stock_actual
=========================================

Orquesta la lectura y procesamiento de archivos de inventario. No conoce
HTTP: recibe bytes + nombre de plataforma y devuelve datos. Así se puede
testear sin levantar FastAPI.
"""

from io import BytesIO

import pandas as pd

from core.supabase import get_supabase

from .platforms import PLATAFORMAS, ConfiguracionPlataforma
from .processor import procesar_archivo

ESTADO_COMPROMETIDO = "f21aa5a4-33d0-419e-aa2a-e10a6369351a"


class PlataformaDesconocidaError(Exception):
    """La plataforma solicitada no está registrada en PLATAFORMAS."""


class ArchivoInvalidoError(Exception):
    """El archivo recibido está vacío o no se pudo procesar."""


def obtener_configuracion(plataforma: str) -> ConfiguracionPlataforma:
    configuracion = PLATAFORMAS.get(plataforma)
    if configuracion is None:
        raise PlataformaDesconocidaError(
            f"Plataforma desconocida: '{plataforma}'. "
            f"Opciones válidas: {sorted(PLATAFORMAS.keys())}"
        )
    return configuracion


def procesar_inventario(plataforma: str, contenido: bytes) -> dict[str, int]:
    """Procesa un archivo y retorna el inventario {sku: stock}."""
    configuracion = obtener_configuracion(plataforma)

    if not contenido:
        raise ArchivoInvalidoError("El archivo está vacío.")

    try:
        return procesar_archivo(configuracion, contenido)
    except Exception as error:
        raise ArchivoInvalidoError(f"No se pudo procesar el archivo: {error}") from error


AreaVenta = str  # "Mercado Libre" | "Amazon" | "B2C"

# B2C filtra por canal; Mercado Libre y Amazon filtran por plataforma.
_FILTROS_AREA: dict[str, tuple[str, str]] = {
    "Mercado Libre": ("movimientos.plataforma", "Mercado Libre"),
    "Amazon":        ("movimientos.plataforma", "Amazon"),
    "B2C":           ("movimientos.canal",      "B2C"),
}


def stock_comprometido(area: AreaVenta | None = None) -> dict[str, int]:
    """
    Retorna {sku: cantidad_total} con un único join:
    mov_prod → movimientos (filtro estado + área) → productos (sku).

    area puede ser "Mercado Libre", "Amazon", "B2C" o None (todo).
    """
    sb = get_supabase()
    consulta = (
        sb.table("mov_prod")
        .select("cantidad, movimientos!inner(estado, plataforma, canal), productos!inner(sku)")
        .eq("movimientos.estado", ESTADO_COMPROMETIDO)
    )
    if area is not None:
        columna, valor = _FILTROS_AREA[area]
        consulta = consulta.eq(columna, valor)

    filas = consulta.execute().data

    totales: dict[str, int] = {}
    for fila in filas:
        sku = fila["productos"]["sku"]
        totales[sku] = totales.get(sku, 0) + fila["cantidad"]
    return totales


def inspeccionar_archivo(plataforma: str, contenido: bytes) -> dict:
    """
    Diagnóstico: muestra las primeras filas que lee pandas, con los índices
    de columna tal como los ve el backend. Permite confirmar si los índices
    en `platforms.py` apuntan a las columnas correctas.
    """
    configuracion = obtener_configuracion(plataforma)
    buffer = BytesIO(contenido)

    if configuracion.formato == "xlsx":
        df = pd.read_excel(buffer, header=None, dtype=str)
    else:
        df = pd.read_csv(
            buffer, header=None, dtype=str,
            keep_default_na=False, on_bad_lines="skip",
        )

    return {
        "total_filas": len(df),
        "total_columnas": len(df.columns),
        "columnas_que_usa_el_backend": configuracion.columnas,
        "primeras_5_filas": [
            {f"col_{i}": str(v) for i, v in enumerate(fila)}
            for fila in df.head(5).itertuples(index=False)
        ],
    }
