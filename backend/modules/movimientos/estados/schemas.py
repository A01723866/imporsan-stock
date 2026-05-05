"""
Schemas del submódulo movimientos/estados
=========================================
"""

from pydantic import BaseModel, Field


class EstadoRespuesta(BaseModel):
    """Un estado tal como se devuelve al cliente."""
    id: str = Field(..., description="UUID del estado")
    texto: str = Field(..., description="Nombre del estado")


class EstadoCrear(BaseModel):
    """Body para crear un estado nuevo."""
    texto: str = Field(..., min_length=1, description="Nombre del estado")
