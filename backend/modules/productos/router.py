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
    return service.listar_productos()
