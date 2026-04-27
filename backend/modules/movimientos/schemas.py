"""
Schemas del módulo movimientos
==============================
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


CanalEnvio = Literal["B2C", "B2B"]


class MovimientoRespuesta(BaseModel):
    """Un movimiento tal como se devuelve al cliente."""
    id: str = Field(..., description="UUID del movimiento")
    nombre: str = Field(..., description="Nombre del movimiento")
    id_interno: str = Field(..., description="Identificador interno legible")
    estado: str = Field(..., description="UUID del estado (FK a estados.id)")
    canal: CanalEnvio = Field(..., description="Canal de envío")
    descripcion: str | None = Field(None, description="Descripción libre")
    notas: str | None = Field(None, description="Notas adicionales")
    fecha_creacion: datetime = Field(..., description="Cuándo se creó el movimiento")
    fecha_modificacion: datetime = Field(..., description="Última vez que se modificó")


class MovimientoCrear(BaseModel):
    """Body para crear un movimiento nuevo."""
    nombre: str = Field(..., min_length=1)
    id_interno: str = Field(..., min_length=1)
    estado: str = Field(..., description="UUID de un estado existente")
    canal: CanalEnvio = Field(...)
    descripcion: str | None = None
    notas: str | None = None


class MovimientoActualizar(BaseModel):
    """Body para editar un movimiento. Todos los campos opcionales."""
    nombre: str | None = Field(None, min_length=1)
    id_interno: str | None = Field(None, min_length=1)
    estado: str | None = None
    canal: CanalEnvio | None = None
    descripcion: str | None = None
    notas: str | None = None
