"""
Lógica de negocio del módulo productos
======================================

Lee el catálogo de productos desde Supabase. Las queries viven aquí
(no en un repositorio central) para que el módulo sea dueño de su
persistencia.
"""

from core.supabase import get_supabase

from .schemas import ProductoRespuesta


TABLA = "productos"


def listar_productos() -> list[ProductoRespuesta]:
    """Retorna todos los productos del catálogo."""
    respuesta = (
        get_supabase()
        .table(TABLA)
        .select("id, sku, nombre, modelo, gtin, estado")
        .execute()
    )
    return [ProductoRespuesta(**fila) for fila in respuesta.data]
