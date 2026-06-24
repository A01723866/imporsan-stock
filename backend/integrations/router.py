"""
Router del módulo amazon
========================

Endpoints 
---------------------------------------------------
GET /api/integraciones/amazon/inventario-raw
    Obtiene el inventario FBA crudo desde el reporte de Amazon
    GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA y lo guarda en backend/docs/
    con timestamp.

Uso
"""

from fastapi import APIRouter, HTTPException

from core.supabase import get_supabase
from integrations.amazon.reports_client import AmazonApiError, obtener_reporte_inventario_fba
from integrations.mercadolibre.client import MeliApiError, obtener_inventario_full

router = APIRouter()

# Estado "Enviado" en tabla estados — movimientos con este estado representan
# envíos despachados (a Full, en el caso de B2B + Mercado Libre = "en camino").
_ESTADO_ENVIADO_ID = "89af0089-6d3b-4a5b-aeb4-39edcdef4b3e"


@router.get("/reporte-inventario-fba")
async def reporte_inventario_fba(forzar_nuevo: bool = False):
    try:
        filas = obtener_reporte_inventario_fba(forzar_nuevo=forzar_nuevo)
    except AmazonApiError as error:
        raise HTTPException(status_code=500, detail=str(error))
    return filas


@router.get("/inventario-meli-full")
async def inventario_meli_full():
    try:
        inventario = obtener_inventario_full()
    except MeliApiError as error:
        raise HTTPException(status_code=500, detail=str(error))
    return inventario


@router.get("/meli-en-camino")
async def meli_en_camino() -> dict[str, int]:
    """
    Retorna { sku: cantidad } sumando productos de movimientos B2B en
    plataforma Mercado Libre con estado Enviado (camino a Full).
    """
    resp = (
        get_supabase()
        .table("mov_prod")
        .select(
            "cantidad,"
            "productos(sku),"
            "mov:movimientos!mov_prod_id_movimiento_fkey!inner(canal,plataforma,estado)"
        )
        .eq("mov.canal", "B2B")
        .eq("mov.plataforma", "Mercado Libre")
        .eq("mov.estado", _ESTADO_ENVIADO_ID)
        .execute()
    )

    en_camino: dict[str, int] = {}
    for fila in resp.data:
        sku = (fila.get("productos") or {}).get("sku")
        if not sku:
            continue
        en_camino[sku] = en_camino.get(sku, 0) + int(fila.get("cantidad") or 0)

    return en_camino

