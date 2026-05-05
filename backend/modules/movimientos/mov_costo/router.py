"""
Router del submódulo movimientos/mov_costo

Endpoints (montados bajo /api/movimientos/costos)
-------------------------------------------------
GET    /           Lista todas las filas mov_costo.
GET    /{id}       Retorna una fila mov_costo por id.
POST   /           Crea una asociación movimiento↔costo_tipo.
DELETE /{id}       Elimina una fila mov_costo.
"""

from fastapi import APIRouter, HTTPException, status

from . import service
from .schemas import MovCostoCrear, MovCostoRespuesta


router = APIRouter()


@router.get("", response_model=list[MovCostoRespuesta], summary="Listar mov_costo")
def listar(id_movimiento: str | None = None) -> list[MovCostoRespuesta]:
    return service.listar(id_movimiento=id_movimiento)


@router.get(
    "/{mov_costo_id}",
    response_model=MovCostoRespuesta,
    summary="Obtener mov_costo por id",
)
def obtener(mov_costo_id: str) -> MovCostoRespuesta:
    try:
        return service.obtener(mov_costo_id)
    except service.MovCostoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post(
    "",
    response_model=MovCostoRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Crear mov_costo",
)
def crear(datos: MovCostoCrear) -> MovCostoRespuesta:
    return service.crear(datos)


@router.delete(
    "/{mov_costo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar mov_costo",
)
def eliminar(mov_costo_id: str) -> None:
    try:
        service.eliminar(mov_costo_id)
    except service.MovCostoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))
