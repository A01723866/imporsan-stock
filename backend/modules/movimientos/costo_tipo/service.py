"""
Lógica de negocio del submódulo movimientos/costo_tipo

CRUD simple sobre la tabla `costo_tipo` en Supabase.
"""

from core.supabase import get_supabase

from .schemas import CostoTipoCrear, CostoTipoRespuesta


TABLA = "costo_tipo"


class CostoTipoNoEncontrado(Exception):
    """No existe un tipo de costo con ese id."""


def listar() -> list[CostoTipoRespuesta]:
    respuesta = get_supabase().table(TABLA).select("id, tipo").execute()
    return [CostoTipoRespuesta(**fila) for fila in respuesta.data]


def obtener(costo_tipo_id: str) -> CostoTipoRespuesta:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .select("id, tipo")
        .eq("id", costo_tipo_id)
        .limit(1)
        .execute()
    )
    if not respuesta.data:
        raise CostoTipoNoEncontrado(f"No existe un tipo de costo con id '{costo_tipo_id}'.")
    return CostoTipoRespuesta(**respuesta.data[0])


def crear(datos: CostoTipoCrear) -> CostoTipoRespuesta:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .insert(datos.model_dump())
        .execute()
    )
    return CostoTipoRespuesta(**respuesta.data[0])


def eliminar(costo_tipo_id: str) -> None:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .delete()
        .eq("id", costo_tipo_id)
        .execute()
    )
    if not respuesta.data:
        raise CostoTipoNoEncontrado(f"No existe un tipo de costo con id '{costo_tipo_id}'.")
