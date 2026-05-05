"""
Router del submódulo movimientos/estados

Endpoints (montados bajo /api/movimientos/estados)
--------------------------------------------------
GET    /           Lista todos los estados.
GET    /{id}       Retorna un estado por id.
POST   /           Crea un estado nuevo.
DELETE /{id}       Elimina un estado.
"""

from fastapi import APIRouter, HTTPException, status

from . import service
from .schemas import EstadoCrear, EstadoRespuesta


router = APIRouter()


@router.get("", response_model=list[EstadoRespuesta], summary="Listar estados")
def listar() -> list[EstadoRespuesta]:
    return service.listar()


@router.get("/{estado_id}", response_model=EstadoRespuesta, summary="Obtener estado por id")
def obtener(estado_id: str) -> EstadoRespuesta:
    try:
        return service.obtener(estado_id)
    except service.EstadoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post(
    "",
    response_model=EstadoRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Crear estado",
)
def crear(datos: EstadoCrear) -> EstadoRespuesta:
    return service.crear(datos)


@router.delete("/{estado_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar estado")
def eliminar(estado_id: str) -> None:
    try:
        service.eliminar(estado_id)
    except service.EstadoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))
