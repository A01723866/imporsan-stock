"""
Router del módulo productos
===========================

Endpoints (montados bajo /api/productos)
----------------------------------------
GET /
    Lista el catálogo de productos desde Supabase.
"""

from fastapi import APIRouter

from . import service
from .schemas import ProductoRespuesta


router = APIRouter()


@router.get(
    "",
    response_model=list[ProductoRespuesta],
    summary="Listar catálogo de productos",
)
def listar_productos() -> list[ProductoRespuesta]:
    try:
        return service.listar_productos()
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": str(e), "type": type(e).__name__})
