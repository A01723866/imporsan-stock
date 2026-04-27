"""
Router del submódulo movimientos/costo_tipo

Endpoints (montados bajo /api/movimientos/costo-tipo)
-----------------------------------------------------
GET    /           Lista todos los tipos de costo.
GET    /{id}       Retorna un tipo de costo por id.
POST   /           Crea un tipo de costo nuevo.
DELETE /{id}       Elimina un tipo de costo.
"""

from fastapi import APIRouter, HTTPException, status

from . import service
from .schemas import CostoTipoCrear, CostoTipoRespuesta


router = APIRouter()


@router.get("", response_model=list[CostoTipoRespuesta], summary="Listar tipos de costo")
def listar() -> list[CostoTipoRespuesta]:
    return service.listar()


@router.get(
    "/{costo_tipo_id}",
    response_model=CostoTipoRespuesta,
    summary="Obtener tipo de costo por id",
)
def obtener(costo_tipo_id: str) -> CostoTipoRespuesta:
    try:
        return service.obtener(costo_tipo_id)
    except service.CostoTipoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post(
    "",
    response_model=CostoTipoRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Crear tipo de costo",
)
def crear(datos: CostoTipoCrear) -> CostoTipoRespuesta:
    return service.crear(datos)


@router.delete(
    "/{costo_tipo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar tipo de costo",
)
def eliminar(costo_tipo_id: str) -> None:
    try:
        service.eliminar(costo_tipo_id)
    except service.CostoTipoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))
