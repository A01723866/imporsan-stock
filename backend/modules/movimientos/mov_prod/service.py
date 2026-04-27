"""
Lógica de negocio del submódulo movimientos/mov_prod

CRUD simple sobre la tabla `mov_prod`.
"""

from core.supabase import get_supabase

from .schemas import MovProdCrear, MovProdRespuesta


TABLA = "mov_prod"
COLUMNAS = "id, id_movimiento, id_producto, cantidad"


class MovProdNoEncontrado(Exception):
    """No existe una fila mov_prod con ese id."""


def listar(id_movimiento: str | None = None) -> list[MovProdRespuesta]:
    consulta = get_supabase().table(TABLA).select(COLUMNAS)
    if id_movimiento is not None:
        consulta = consulta.eq("id_movimiento", id_movimiento)
    respuesta = consulta.execute()
    return [MovProdRespuesta(**fila) for fila in respuesta.data]


def obtener(mov_prod_id: str) -> MovProdRespuesta:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .select(COLUMNAS)
        .eq("id", mov_prod_id)
        .limit(1)
        .execute()
    )
    if not respuesta.data:
        raise MovProdNoEncontrado(f"No existe mov_prod con id '{mov_prod_id}'.")
    return MovProdRespuesta(**respuesta.data[0])


def crear(datos: MovProdCrear) -> MovProdRespuesta:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .insert(datos.model_dump())
        .execute()
    )
    return MovProdRespuesta(**respuesta.data[0])


def eliminar(mov_prod_id: str) -> None:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .delete()
        .eq("id", mov_prod_id)
        .execute()
    )
    if not respuesta.data:
        raise MovProdNoEncontrado(f"No existe mov_prod con id '{mov_prod_id}'.")
