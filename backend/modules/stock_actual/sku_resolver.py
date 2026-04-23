"""
Resolución de SKUs: del dato crudo al SKU canónico
==================================================

Cada plataforma reporta sus productos de forma distinta. Este módulo
traduce esos identificadores al SKU canónico de Imporsan (y opcionalmente
aplica un multiplicador para kits).

Interfaz común
--------------
Todos los resolvers reciben una `fila` (dict con los campos relevantes ya
extraídos del archivo) y retornan uno de dos resultados:

- `(sku_canonico, multiplicador)` — se encontró un match, el stock de la
  fila debe multiplicarse por `multiplicador` y sumarse al `sku_canonico`.
- `None` — la fila no corresponde a ningún producto del catálogo; se ignora.

Esto permite que el `processor` trate a todas las plataformas por igual.
"""

import re
from typing import Optional

from .mappings import (
    KITS_A_BASE,
    MULTIPLICADORES_SKU,
    NOMBRE_SPAKIO_A_SKU,
    SKU_ANTIGUO_A_NUEVO,
)


# Patrón del SKU canónico: L-LL-LLL-NNNN (ej. "H-WT-LAD-0022")
PATRON_SKU_NUEVO = re.compile(r"[A-Z]-[A-Z]{2}-[A-Z]{3}-\d{4}")

# Patrón de código antiguo entre paréntesis: (MT1024), (X004R6G2VP), etc.
PATRON_CODIGO_ANTIGUO = re.compile(r"\((MT[\w-]+|X[\w]+)\)")


# Resultado común de todos los resolvers.
Resultado = Optional[tuple[str, int]]


def resolver_por_sku_directo(fila: dict) -> Resultado:
    """
    Resolver para MercadoLibre y Amazon.

    La plataforma reporta el SKU directamente en una columna. Si el SKU
    corresponde a un KIT conocido, se convierte al SKU del producto base.
    No aplica multiplicador (siempre 1).
    """
    sku_crudo = _texto_limpio(fila.get("sku"))
    if not sku_crudo:
        return None

    sku_canonico = KITS_A_BASE.get(sku_crudo, sku_crudo)
    return (sku_canonico, 1)


def resolver_spakio(fila: dict) -> Resultado:
    """
    Resolver para Spakio.

    Spakio no reporta un SKU estandarizado, sino el nombre del producto.
    Se prueban tres estrategias en orden de prioridad:

    1. SKU canónico embebido en el nombre
       Ej. "BB Savage C-BB-DIS-0003" → "C-BB-DIS-0003".
       Algunos SKUs tienen multiplicador fijo (ver `MULTIPLICADORES_SKU`).

    2. Código antiguo entre paréntesis
       Ej. "Wall Tiles Mármol Roca (MT1024)" → SKU_ANTIGUO_A_NUEVO["MT1024"].

    3. Nombre exacto en tabla
       Ej. "Kit de 2 pares de pesas de 2.5KG" → {"sku": ..., "mult": 2}.

    Si ninguna estrategia encuentra un match, la fila se ignora.
    """
    nombre = _texto_limpio(fila.get("nombre"))
    if not nombre:
        return None

    # Estrategia 1: SKU canónico embebido
    match = PATRON_SKU_NUEVO.search(nombre)
    if match:
        sku = match.group(0)
        return (sku, MULTIPLICADORES_SKU.get(sku, 1))

    # Estrategia 2: código antiguo entre paréntesis
    match = PATRON_CODIGO_ANTIGUO.search(nombre)
    if match:
        codigo = match.group(1)
        sku = SKU_ANTIGUO_A_NUEVO.get(codigo)
        if sku:
            return (sku, 1)

    # Estrategia 3: nombre exacto en tabla
    mapeo = NOMBRE_SPAKIO_A_SKU.get(nombre)
    if mapeo:
        return (str(mapeo["sku"]), int(mapeo["mult"]))

    return None


def _texto_limpio(valor) -> str:
    """Convierte cualquier valor a string y recorta espacios. Vacío si es None."""
    if valor is None:
        return ""
    return str(valor).strip()
