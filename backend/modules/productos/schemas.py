"""
Schemas del módulo productos
============================
"""

from typing import Literal

from pydantic import BaseModel, Field


EstadoProducto = Literal["Descontinuado", "En Liquidación", "Activo", "Labs"]


class ProductoRespuesta(BaseModel):
    """Un producto del catálogo."""
    id: str = Field(..., description="UUID del producto")
    sku: str | None = Field(None, description="SKU canónico del producto")
    nombre: str | None = Field(None, description="Nombre legible del producto")
    modelo: str | None = Field(None, description="Modelo del producto")
    gtin: str | None = Field(None, description="Código GTIN / código de barras")
    estado: EstadoProducto | None = Field(None, description="Estado del producto")
