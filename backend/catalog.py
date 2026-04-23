"""
Catálogo base de productos de Imporsan
======================================

Lista maestra de los productos que el sistema rastrea. Cada producto tiene
un SKU canónico (único) y un nombre legible.

Todo el inventario consolidado se construye sobre este catálogo: por cada
producto aquí definido se calcula cuánto stock hay en MercadoLibre, Amazon
y Spakio.

Para agregar un producto nuevo: añade una entrada a la lista. Para que
aparezca correctamente en los archivos de las plataformas, asegúrate de
que su SKU coincida con el que reportan las plataformas (o de agregar un
mapeo en `mappings.py` si usan un identificador distinto).
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Producto:
    """Un producto del catálogo base (solo identidad, sin stock)."""
    sku: str
    nombre: str


CATALOGO_PRODUCTOS: list[Producto] = [
    Producto("C-BA-OLI-0200", "Barra Z 20 lbs"),
    Producto("C-BA-OLI-0210", "Barra Z (6.3kg) con bujes"),
    Producto("C-BB-DIS-0001", "BB Casco"),
    Producto("C-BB-DIS-0002", "BB No Pain No Gain"),
    Producto("C-BB-DIS-0003", "BB Savage"),
    Producto("C-DI-KGS-0025", "Par Discos 2.5 kg"),
    Producto("C-DI-KGS-0050", "Par Discos 5 kg"),
    Producto("C-DI-KGS-0100", "Par Discos 10 kg"),
    Producto("C-DI-KGS-0150", "Par Discos 15kg"),
    Producto("C-DI-KGS-0200", "Par Discos 20kg"),
    Producto("C-DI-LBS-0025", "Par Discos 2.5 lbs"),
    Producto("C-DI-LBS-0050", "Par Discos 5 lbs"),
    Producto("C-DI-LBS-0100", "Par Discos 10 lbs"),
    Producto("C-DI-LBS-0350", "Par Discos 35 lbs"),
    Producto("C-MC-HEX-0050", "Par Mancuernas Hexagonal 5lb"),
    Producto("C-MC-HEX-0100", "Par Mancuernas Hexagonal 10lb"),
    Producto("C-MC-HEX-0150", "Par Mancuernas Hexagonal 15lb"),
    Producto("C-MC-HEX-0200", "Par Mancuernas Hexagonal 20lb"),
    Producto("C-MC-HEX-0250", "Par Mancuernas Hexagonal 25lb"),
    Producto("C-MC-HEX-0300", "Par Mancuernas Hexagonal 30lb"),
    Producto("H-FT-BAS-0001", "Floor Tiles Mármol Carrara"),
    Producto("H-FT-BAS-0002", "Floor Tiles Mármol Marquina"),
    Producto("H-FT-BAS-0003", "Floor Tiles Mármol Ceniza"),
    Producto("H-FT-BAS-0004", "Floor Tiles Mármol Gris"),
    Producto("H-FT-BAS-0005", "Floor Tiles Pino Miel"),
    Producto("H-FT-BAS-0006", "Floor Tiles Sombra Nogal"),
    Producto("H-PI-PAR-0003", "Piso Deck Parquet Gold"),
    Producto("H-PI-PAR-0004", "Piso Deck Parquet Café"),
    Producto("H-PI-VER-0001", "Piso Deck Vertical Gold"),
    Producto("H-PI-VER-0002", "Piso Deck Vertical Café"),
    Producto("H-WP-RAY-0001", "Wall Panel Arena Fina"),
    Producto("H-WP-RAY-0002", "Wall Panel Bambú Claro"),
    Producto("H-WP-RAY-0003", "Wall Panel Pino Nórdico"),
    Producto("H-WP-RAY-0004", "Wall Panel Gris Carbón"),
    Producto("H-WP-RAY-0005", "Wall Panel Pino Nogal"),
    Producto("H-WT-COL-0001", "Wall Tiles Verde Esmeralda"),
    Producto("H-WT-COL-0002", "Wall Tiles Ceniza Volcánica"),
    Producto("H-WT-COL-0003", "Wall Tiles Gris Ártico"),
    Producto("H-WT-COL-0004", "Wall Tiles Desierto Crema"),
    Producto("H-WT-COL-0005", "Wall Tiles Rosa Antigua"),
    Producto("H-WT-COL-0006", "Wall Tiles Caoba Rústica"),
    Producto("H-WT-COL-0007", "Wall Tiles Ónix Negro"),
    Producto("H-WT-COL-0008", "Wall Tiles Azul Noche"),
    Producto("H-WT-CUA-0009", "Wall Tiles Verde Selva"),
    Producto("H-WT-CUA-0010", "Wall Tiles Lima Fresca"),
    Producto("H-WT-CUA-0011", "Wall Tiles Tierra Mojave"),
    Producto("H-WT-CUA-0012", "Wall Tiles Jade Sereno"),
    Producto("H-WT-HEX-0017", "Wall Tiles Hexágono Gris"),
    Producto("H-WT-HEX-0018", "Wall Tiles Hexágono Glaciar"),
    Producto("H-WT-HEX-0019", "Wall Tiles Hexágono Marmol Terracota"),
    Producto("H-WT-LAD-0020", "Wall Tiles Mármol Carrara"),
    Producto("H-WT-LAD-0021", "Wall Tiles Mármol Nube"),
    Producto("H-WT-LAD-0022", "Wall Tiles Mármol Roca"),
    Producto("H-WT-LAD-0023", "Wall Tiles Halo Gris"),
    Producto("H-WT-LAD-0024", "Wall Tiles Halo Blanco"),
    Producto("H-WT-LAD-0025", "Wall Tiles Nube Clara"),
    Producto("H-WT-LAD-0026", "Wall Tiles Piedra Alpina"),
    Producto("H-WT-LAD-0027", "Wall Tiles Jade Urbano"),
    Producto("H-WT-SUB-0013", "Wall Tiles Subway Perla"),
    Producto("H-WT-SUB-0014", "Wall Tiles Subway Verde Olivo"),
    Producto("H-WT-SUB-0015", "Wall Tiles Subway Blanco"),
    Producto("H-WT-SUB-0016", "Wall Tiles Subway Ártico"),
]
