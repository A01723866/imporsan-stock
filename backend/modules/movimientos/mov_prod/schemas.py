"""
Schemas del submódulo movimientos/mov_prod
==========================================

Tabla `mov_prod`: asociación entre un movimiento y un producto, con la
cantidad involucrada.
"""

from pydantic import BaseModel, Field


class MovProdRespuesta(BaseModel):
    id: str = Field(..., description="UUID de la fila")
    id_movimiento: str = Field(..., description="UUID del movimiento")
    id_producto: str = Field(..., description="UUID del producto")
    cantidad: int = Field(..., description="Cantidad de unidades")


class MovProdCrear(BaseModel):
    id_movimiento: str = Field(..., description="UUID de un movimiento existente")
    id_producto: str = Field(..., description="UUID de un producto existente")
    cantidad: int = Field(..., description="Cantidad de unidades")
