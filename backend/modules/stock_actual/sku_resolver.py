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

from typing import Optional

from .mappings import KITS_A_BASE


# Resultado común de todos los resolvers.
Resultado = Optional[tuple[str, int]]


def resolver_por_sku_directo(fila: dict) -> Resultado:
    """
    Resolver para MercadoLibre y Amazon.

    La plataforma reporta el SKU directamente en una columna. Si el SKU
    corresponde a un KIT conocido, se convierte al SKU del producto base
    con el multiplicador definido en KITS_A_BASE.
    """
    sku_crudo = _texto_limpio(fila.get("sku"))
    if not sku_crudo:
        return None

    kit = KITS_A_BASE.get(sku_crudo)
    if kit:
        sku_base, multiplicador = kit
        return (sku_base, multiplicador)
    return (sku_crudo, 1)


def _texto_limpio(valor) -> str:
    """Convierte cualquier valor a string y recorta espacios. Vacío si es None.
    También quita apóstrofo inicial (los exports de almacén lo agregan para
    forzar Excel a tratar el SKU como texto)."""
    if valor is None:
        return ""
    return str(valor).strip().lstrip("'")
