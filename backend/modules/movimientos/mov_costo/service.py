"""
Lógica de negocio del submódulo movimientos/mov_costo

CRUD simple sobre la tabla `mov_costo`.
"""

from core.supabase import get_supabase

from .schemas import MovCostoCrear, MovCostoRespuesta


TABLA = "mov_costo"
COLUMNAS = "id, id_movimiento, id_costo, cantidad"


class MovCostoNoEncontrado(Exception):
    """No existe una fila mov_costo con ese id."""


def listar(id_movimiento: str | None = None) -> list[MovCostoRespuesta]:
    consulta = get_supabase().table(TABLA).select(COLUMNAS)
    if id_movimiento is not None:
        consulta = consulta.eq("id_movimiento", id_movimiento)
    respuesta = consulta.execute()
    return [MovCostoRespuesta(**fila) for fila in respuesta.data]


def obtener(mov_costo_id: str) -> MovCostoRespuesta:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .select(COLUMNAS)
        .eq("id", mov_costo_id)
        .limit(1)
        .execute()
    )
    if not respuesta.data:
        raise MovCostoNoEncontrado(f"No existe mov_costo con id '{mov_costo_id}'.")
    return MovCostoRespuesta(**respuesta.data[0])


def crear(datos: MovCostoCrear) -> MovCostoRespuesta:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .insert(datos.model_dump())
        .execute()
    )
    return MovCostoRespuesta(**respuesta.data[0])


def eliminar(mov_costo_id: str) -> None:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .delete()
        .eq("id", mov_costo_id)
        .execute()
    )
    if not respuesta.data:
        raise MovCostoNoEncontrado(f"No existe mov_costo con id '{mov_costo_id}'.")
