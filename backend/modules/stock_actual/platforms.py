"""
Configuración declarativa de plataformas
========================================

Cada plataforma (MercadoLibre, Amazon, Spakio) exporta un archivo con un
formato distinto, pero todas comparten la misma estructura conceptual:

    "tal columna tiene el identificador, tal otra tiene el stock".

En vez de escribir un handler diferente para cada plataforma, aquí cada
una se describe con una `ConfiguracionPlataforma`. El `processor` toma
esa configuración y hace el trabajo pesado de forma genérica.

Cómo agregar una plataforma nueva
---------------------------------
1. Define las columnas que te interesan (índice → nombre lógico).
2. Crea un resolver en `sku_resolver.py` si ninguno existente te sirve.
3. Agrega un entry a `PLATAFORMAS` con el formato del archivo, las
   columnas, y el resolver.

Eso es todo. No hay handlers, parsers o registros adicionales que tocar.
"""

from dataclasses import dataclass
from typing import Callable, Literal

from .sku_resolver import (
    Resultado,
    resolver_por_sku_directo,
)


@dataclass(frozen=True)
class ConfiguracionPlataforma:
    """
    Describe cómo procesar los archivos de una plataforma.

    Atributos
    ---------
    formato:
        "xlsx" o "csv". Determina qué lector usar.

    columnas:
        Mapeo `índice_de_columna → nombre_lógico`. Solo se extraen las
        columnas listadas aquí. Los nombres lógicos (`"sku"`, `"stock"`,
        `"nombre"`) deben coincidir con los que espera el `resolver`.

    resolver:
        Función que, dada una fila con las columnas extraídas, retorna
        `(sku_canonico, multiplicador)` o `None`.

    saltar_filas:
        Cuántas filas iniciales ignorar (útil cuando el archivo tiene
        una fila de encabezado que no queremos procesar).
    """
    formato: Literal["xlsx", "csv", "tsv"]
    columnas: dict[int, str]
    resolver: Callable[[dict], Resultado]
    saltar_filas: int = 0


# ---------------------------------------------------------------------------
# Registro de plataformas soportadas
# ---------------------------------------------------------------------------
# La clave ("mercadolibre", "amazon", "spakio") es la que se usa en la URL
# del endpoint: POST /api/upload/{plataforma}.

PLATAFORMAS: dict[str, ConfiguracionPlataforma] = {

    # MercadoLibre exporta un XLSX con 27 columnas. Solo nos interesan
    # el SKU y las unidades disponibles para vender en Full.
    "mercadolibre": ConfiguracionPlataforma(
        formato="xlsx",
        columnas={
            3:  "sku",    # columna "SKU"
            21: "stock",  # columna de stock total
        },
        resolver=resolver_por_sku_directo,
    ),

    # Amazon exporta un CSV con 61 columnas. Solo nos interesan el SKU y
    # el inventario disponible en FBA.
    "amazon": ConfiguracionPlataforma(
        formato="csv",
        columnas={
            0:  "sku",    # columna "sku"
            13: "stock",  # columna "afn-total-quantity"
        },
        resolver=resolver_por_sku_directo,
    ),

    # Amazon "inventario en reserva": CSV con SKU y unidades reservadas por
    # órdenes de clientes. Se resta del stock Amazon en la vista de stock.
    "amazon_reserva": ConfiguracionPlataforma(
        formato="csv",
        columnas={
            0: "sku",    # columna "sku"
            5: "stock",  # columna "reserved_customerorders"
        },
        resolver=resolver_por_sku_directo,
    ),

    # Almacenes propios (MTY y Tulti) exportan un archivo con extensión .xls
    # que en realidad es TSV. Misma estructura para ambos.
    # Col 1: Código (SKU con apóstrofo inicial), Col 5: Cantidad.
    "almacen_mty": ConfiguracionPlataforma(
        formato="tsv",
        columnas={1: "sku", 5: "stock"},
        resolver=resolver_por_sku_directo,
        saltar_filas=1,
    ),
    "almacen_tulti": ConfiguracionPlataforma(
        formato="tsv",
        columnas={1: "sku", 5: "stock"},
        resolver=resolver_por_sku_directo,
        saltar_filas=1,
    ),

}
