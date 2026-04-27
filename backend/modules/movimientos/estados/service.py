"""
Lógica de negocio del submódulo movimientos/estados

CRUD simple sobre la tabla `estados` en Supabase.
"""

from core.supabase import get_supabase

from .schemas import EstadoCrear, EstadoRespuesta


TABLA = "estados"


class EstadoNoEncontrado(Exception):
    """No existe un estado con ese id."""


def listar() -> list[EstadoRespuesta]:
    respuesta = get_supabase().table(TABLA).select("id, texto").execute()
    return [EstadoRespuesta(**fila) for fila in respuesta.data]


def obtener(estado_id: str) -> EstadoRespuesta:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .select("id, texto")
        .eq("id", estado_id)
        .limit(1)
        .execute()
    )
    if not respuesta.data:
        raise EstadoNoEncontrado(f"No existe un estado con id '{estado_id}'.")
    return EstadoRespuesta(**respuesta.data[0])


def crear(datos: EstadoCrear) -> EstadoRespuesta:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .insert(datos.model_dump())
        .execute()
    )
    return EstadoRespuesta(**respuesta.data[0])


def eliminar(estado_id: str) -> None:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .delete()
        .eq("id", estado_id)
        .execute()
    )
    if not respuesta.data:
        raise EstadoNoEncontrado(f"No existe un estado con id '{estado_id}'.")
