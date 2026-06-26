"""
Schemas del módulo stock_actual
===============================

Modelos Pydantic que definen la forma del JSON que devuelven los
endpoints de este módulo.
"""

from pydantic import BaseModel, Field


class InventarioRespuesta(BaseModel):
    """Resultado de procesar un archivo de una plataforma."""
    plataforma: str = Field(..., description="Plataforma procesada (ej. 'mercadolibre')")
    inventario: dict[str, int] = Field(
        ...,
        description="Diccionario SKU → stock",
    )
    productos_encontrados: int = Field(
        ...,
        description="Cuántos SKUs distintos se resolvieron exitosamente",
    )
