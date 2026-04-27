"""
Router del módulo movimientos

Endpoints (montados bajo /api/movimientos)
------------------------------------------
GET    /           Lista todos los movimientos.
GET    /{id}       Retorna un movimiento por id.
POST   /           Crea un movimiento nuevo.
DELETE /{id}       Elimina un movimiento.
"""

from fastapi import APIRouter, HTTPException, status

from . import service
from .schemas import MovimientoActualizar, MovimientoCrear, MovimientoRespuesta


router = APIRouter()


@router.get("", response_model=list[MovimientoRespuesta], summary="Listar movimientos")
def listar() -> list[MovimientoRespuesta]:
    return service.listar()


@router.get(
    "/{movimiento_id}",
    response_model=MovimientoRespuesta,
    summary="Obtener movimiento por id",
)
def obtener(movimiento_id: str) -> MovimientoRespuesta:
    try:
        return service.obtener(movimiento_id)
    except service.MovimientoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post(
    "",
    response_model=MovimientoRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Crear movimiento",
)
def crear(datos: MovimientoCrear) -> MovimientoRespuesta:
    return service.crear(datos)


@router.patch(
    "/{movimiento_id}",
    response_model=MovimientoRespuesta,
    summary="Actualizar movimiento (parcial)",
)
def actualizar(movimiento_id: str, datos: MovimientoActualizar) -> MovimientoRespuesta:
    try:
        return service.actualizar(movimiento_id, datos)
    except service.MovimientoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.delete(
    "/{movimiento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar movimiento",
)
def eliminar(movimiento_id: str) -> None:
    try:
        service.eliminar(movimiento_id)
    except service.MovimientoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))
