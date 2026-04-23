"""
Tablas de mapeo de SKUs
=======================

Este módulo concentra TODAS las tablas de conversión de SKU que usa el sistema.
Si necesitas agregar, corregir o eliminar un mapeo, este es el único archivo
que debes tocar.

Glosario
--------
- SKU canónico: El identificador único y definitivo de un producto en el
  catálogo de Imporsan (ej. "H-WT-LAD-0022"). Sigue el patrón
  L-LL-LLL-NNNN (letra, dos letras, tres letras, cuatro dígitos).

- SKU antiguo: Códigos heredados del proveedor original (ej. "MT1024").
  Aparecen entre paréntesis dentro del nombre del producto en Spakio.

- KIT: Un producto que empaqueta varias unidades de un producto base
  (ej. "C-DI-KIT-0025" es un kit del producto base "C-DI-KGS-0025").
  Cuando una plataforma reporta stock de un KIT, ese stock se suma al
  producto base.
"""


# ---------------------------------------------------------------------------
# 1. SKU antiguo → SKU canónico
# ---------------------------------------------------------------------------
# Se usa cuando Spakio reporta un producto con el código antiguo entre
# paréntesis en el nombre, por ejemplo: "Wall Tiles Mármol Roca (MT1024)".
SKU_ANTIGUO_A_NUEVO: dict[str, str] = {
    "MT1024":    "H-WT-LAD-0022",
    "MT1224A":   "H-WT-LAD-0024",
    "MT1250A":   "H-WT-HEX-0019",
    "MT1175A":   "H-WT-HEX-0017",
    "MT1190A":   "H-WT-HEX-0018",
    "MT1390-30": "H-WT-COL-0002",
    "MT1038A":   "H-WT-LAD-0025",
    "MT1387":    "H-WT-COL-0006",
    "MT1385-30": "H-WT-COL-0005",
    "MT1329":    "H-WT-SUB-0015",
    "MT1330":    "H-WT-SUB-0016",
    "MT1346":    "H-WT-CUA-0009",
    "MT1386":    "H-WT-COL-0008",
    "X004R6G2VP":"H-WT-LAD-0026",
}


# ---------------------------------------------------------------------------
# 2. Nombre exacto en Spakio → SKU canónico + multiplicador
# ---------------------------------------------------------------------------
# Algunos productos en Spakio no tienen SKU embebido ni código antiguo, sino
# que se identifican solo por su nombre exacto. Algunos además son "kits"
# que contienen varias unidades del producto base, por lo que el stock se
# multiplica (ej. "Kit de 2 pares de pesas de 2.5KG" = 2 unidades).
NOMBRE_SPAKIO_A_SKU: dict[str, dict[str, str | int]] = {
    "Vertical gold":                          {"sku": "H-PI-VER-0001", "mult": 1},
    "Parquet Gold":                           {"sku": "H-PI-PAR-0003", "mult": 1},
    "Parquet Cafe":                           {"sku": "H-PI-PAR-0004", "mult": 1},
    "Vertical Cafe":                          {"sku": "H-PI-VER-0002", "mult": 1},
    "Gris carbon(Rollo)":                     {"sku": "H-WP-RAY-0004", "mult": 1},
    "Pino nogal(Rollo)":                      {"sku": "H-WP-RAY-0005", "mult": 1},
    "Bambu claro(Rollo)":                     {"sku": "H-WP-RAY-0002", "mult": 1},
    "Kit de par de discos de pesas de 10 kg": {"sku": "C-DI-KGS-0100", "mult": 1},
    "Kit de 2 pares de pesas de 2.5kg5.5LB":  {"sku": "C-DI-KGS-0025", "mult": 2},
    "Kit de 2 pares de pesas de 2.5KG":       {"sku": "C-DI-KGS-0025", "mult": 2},
    "KIT de 2 pares de pesas de 5Kg":         {"sku": "C-DI-KGS-0050", "mult": 2},
    "par de pesas de 2.5KG":                  {"sku": "C-DI-KGS-0025", "mult": 1},
    "Par de pesas de 10 LB":                  {"sku": "C-DI-LBS-0100", "mult": 1},
    "Par de discos de 10LB":                  {"sku": "C-DI-LBS-0100", "mult": 1},
    "Kit de 5 pares de discos de 2.5 LB":     {"sku": "C-DI-LBS-0025", "mult": 5},
    "Kit de 5 pares de discos de 5 LB":       {"sku": "C-DI-LBS-0050", "mult": 5},
    "Barra curl olympic":                     {"sku": "C-BA-OLI-0200", "mult": 1},
}


# ---------------------------------------------------------------------------
# 3. Multiplicadores por SKU nuevo (para Spakio)
# ---------------------------------------------------------------------------
# Cuando Spakio reporta estos SKUs embebidos en el nombre, el stock reportado
# representa una cantidad multiplicada del producto base (típicamente kits).
MULTIPLICADORES_SKU: dict[str, int] = {
    "C-BB-DIS-0001": 10,
    "C-BB-DIS-0002": 10,
    "C-BB-DIS-0003": 10,
}


# ---------------------------------------------------------------------------
# 4. SKU de KIT → SKU del producto base (para MeLi y Amazon)
# ---------------------------------------------------------------------------
# Cuando MercadoLibre o Amazon reportan un KIT, el stock se acumula en el
# producto base correspondiente, no en el KIT.
KITS_A_BASE: dict[str, str] = {
    "C-DI-KIT-0025": "C-DI-KGS-0025",
    "C-DI-KIT-0050": "C-DI-KGS-0050",
}
