"""
Schemas del submódulo movimientos/costo_tipo
============================================
"""

from pydantic import BaseModel, Field


class CostoTipoRespuesta(BaseModel):
    """Un tipo de costo tal como se devuelve al cliente."""
    id: str = Field(..., description="UUID del tipo de costo")
    tipo: str = Field(..., description="Nombre del tipo de costo")


class CostoTipoCrear(BaseModel):
    """Body para crear un tipo de costo nuevo."""
    tipo: str = Field(..., min_length=1, description="Nombre del tipo de costo")
