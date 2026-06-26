"""
Tablas de mapeo de SKUs
=======================

- KIT: Un producto que empaqueta varias unidades de un producto base
  (ej. "C-DI-KIT-0025" es un kit del producto base "C-DI-KGS-0025").
  Cuando una plataforma reporta stock de un KIT, ese stock se suma al
  producto base.
"""


# SKU de KIT → (SKU del producto base, multiplicador)
# Cuando MercadoLibre o Amazon reportan un KIT, el stock se acumula en el
# producto base con el multiplicador correspondiente.
KITS_A_BASE: dict[str, tuple[str, int]] = {
    "C-DI-KIT-0025": ("C-DI-KGS-0025", 2),
    "C-DI-KIT-0050": ("C-DI-KGS-0050", 2),
}
