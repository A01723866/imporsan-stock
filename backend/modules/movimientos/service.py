"""
Lógica de negocio del módulo movimientos

CRUD simple sobre la tabla `movimientos` en Supabase.
"""

from core.supabase import get_supabase

from .schemas import MovimientoActualizar, MovimientoCrear, MovimientoRespuesta


TABLA = "movimientos"
COLUMNAS = (
    "id, nombre, id_interno, estado, canal, descripcion, notas, "
    "fecha_creacion, fecha_modificacion"
)


class MovimientoNoEncontrado(Exception):
    """No existe un movimiento con ese id."""


def listar() -> list[MovimientoRespuesta]:
    respuesta = get_supabase().table(TABLA).select(COLUMNAS).execute()
    return [MovimientoRespuesta(**fila) for fila in respuesta.data]


def obtener(movimiento_id: str) -> MovimientoRespuesta:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .select(COLUMNAS)
        .eq("id", movimiento_id)
        .limit(1)
        .execute()
    )
    if not respuesta.data:
        raise MovimientoNoEncontrado(f"No existe un movimiento con id '{movimiento_id}'.")
    return MovimientoRespuesta(**respuesta.data[0])


def crear(datos: MovimientoCrear) -> MovimientoRespuesta:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .insert(datos.model_dump())
        .execute()
    )
    return MovimientoRespuesta(**respuesta.data[0])


def actualizar(movimiento_id: str, datos: MovimientoActualizar) -> MovimientoRespuesta:
    cambios = datos.model_dump(exclude_unset=True)
    if not cambios:
        return obtener(movimiento_id)

    respuesta = (
        get_supabase()
        .table(TABLA)
        .update(cambios)
        .eq("id", movimiento_id)
        .execute()
    )
    if not respuesta.data:
        raise MovimientoNoEncontrado(f"No existe un movimiento con id '{movimiento_id}'.")
    return MovimientoRespuesta(**respuesta.data[0])


def eliminar(movimiento_id: str) -> None:
    respuesta = (
        get_supabase()
        .table(TABLA)
        .delete()
        .eq("id", movimiento_id)
        .execute()
    )
    if not respuesta.data:
        raise MovimientoNoEncontrado(f"No existe un movimiento con id '{movimiento_id}'.")
