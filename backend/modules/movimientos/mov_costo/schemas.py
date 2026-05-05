"""
Schemas del submódulo movimientos/mov_costo
===========================================

Tabla `mov_costo`: asociación entre un movimiento y un tipo de costo,
con la cantidad monetaria asociada.
"""

from pydantic import BaseModel, Field


class MovCostoRespuesta(BaseModel):
    id: str = Field(..., description="UUID de la fila")
    id_movimiento: str = Field(..., description="UUID del movimiento")
    id_costo: str = Field(..., description="UUID del tipo de costo (FK a costo_tipo.id)")
    cantidad: float = Field(..., description="Cantidad / monto del costo")


class MovCostoCrear(BaseModel):
    id_movimiento: str = Field(..., description="UUID de un movimiento existente")
    id_costo: str = Field(..., description="UUID de un costo_tipo existente")
    cantidad: float = Field(..., description="Cantidad / monto del costo")
