"""
Schemas del módulo stock_actual
===============================

Modelos Pydantic que definen la forma del JSON que devuelven los
endpoints de este módulo.
"""

from pydantic import BaseModel, Field


class InventarioRespuesta(BaseModel):
    """
    Resultado de procesar un archivo de una plataforma.

    El campo `inventario` es un diccionario `{sku: stock}` que solo incluye
    los SKUs encontrados en el archivo. Los SKUs que no aparecen se asumen
    con stock 0 en esa plataforma.
    """
    plataforma: str = Field(..., description="Plataforma procesada (ej. 'mercadolibre')")
    inventario: dict[str, int] = Field(
        ...,
        description="Diccionario SKU → stock extraído del archivo",
    )
    productos_encontrados: int = Field(
        ...,
        description="Cuántos SKUs distintos se resolvieron exitosamente",
    )
