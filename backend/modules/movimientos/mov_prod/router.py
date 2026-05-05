"""
Router del submódulo movimientos/mov_prod

Endpoints (montados bajo /api/movimientos/productos)
----------------------------------------------------
GET    /           Lista todas las filas mov_prod.
GET    /{id}       Retorna una fila mov_prod por id.
POST   /           Crea una asociación movimiento↔producto.
DELETE /{id}       Elimina una fila mov_prod.
"""

from fastapi import APIRouter, HTTPException, status

from . import service
from .schemas import MovProdCrear, MovProdRespuesta


router = APIRouter()


@router.get("", response_model=list[MovProdRespuesta], summary="Listar mov_prod")
def listar(id_movimiento: str | None = None) -> list[MovProdRespuesta]:
    return service.listar(id_movimiento=id_movimiento)


@router.get(
    "/{mov_prod_id}",
    response_model=MovProdRespuesta,
    summary="Obtener mov_prod por id",
)
def obtener(mov_prod_id: str) -> MovProdRespuesta:
    try:
        return service.obtener(mov_prod_id)
    except service.MovProdNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post(
    "",
    response_model=MovProdRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Crear mov_prod",
)
def crear(datos: MovProdCrear) -> MovProdRespuesta:
    return service.crear(datos)


@router.delete(
    "/{mov_prod_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar mov_prod",
)
def eliminar(mov_prod_id: str) -> None:
    try:
        service.eliminar(mov_prod_id)
    except service.MovProdNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error))
