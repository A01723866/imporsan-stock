"""
Modelos de respuesta de la API
==============================

Schemas Pydantic que definen la forma exacta del JSON que devuelve cada
endpoint. FastAPI los usa para:

- Validar las respuestas.
- Generar automáticamente la documentación interactiva en `/docs`.
"""

from pydantic import BaseModel, Field


class ProductoRespuesta(BaseModel):
    """Un producto del catálogo base (sin datos de stock)."""
    sku: str = Field(..., description="SKU canónico del producto")
    nombre: str = Field(..., description="Nombre legible del producto")


class InventarioRespuesta(BaseModel):
    """
    Resultado de procesar un archivo de una plataforma.

    El campo `inventario` es un diccionario `{sku: stock}` que solo incluye
    los SKUs encontrados en el archivo. Los SKUs que no aparecen
    simplemente no están en el dict (se asume stock 0 en esa plataforma).
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
