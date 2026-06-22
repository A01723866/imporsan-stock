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

from fastapi import APIRouter

router = APIRouter()

from integrations.amazon.reports_client import AmazonApiError, obtener_reporte_inventario_fba
from fastapi import HTTPException

@router.get("/reporte-inventario-fba")
async def reporte_inventario_fba(forzar_nuevo: bool = False):
    try:
        filas = obtener_reporte_inventario_fba(forzar_nuevo=forzar_nuevo)
    except AmazonApiError as error:
        raise HTTPException(status_code=500, detail=str(error))
    return filas

