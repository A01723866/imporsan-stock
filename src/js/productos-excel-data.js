/**
 * Fuente única de verdad para la tabla de productos.
 * Persiste en sessionStorage al cambiar; al cargar cualquier página se restaura desde ahí.
 */

const IMPOR_SAN_PRODUCTOS_STORAGE_KEY = 'impor-san-productos-excel-filas';

function loadFromStorage() {
  try {
    const raw = sessionStorage.getItem(IMPOR_SAN_PRODUCTOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        productos = parsed;
      }
    }
  } catch (_) {
    // Si falla el parse, se mantiene el array por defecto
  }
}

function saveToStorage() {
  try {
    sessionStorage.setItem(IMPOR_SAN_PRODUCTOS_STORAGE_KEY, JSON.stringify(productos));
  } catch (_) {}
}

/** @typedef {{ nombre: string, sku: string|null, mercadolibre?: string, amazon?: string, spakio?: string, total?: string }} ProductoFila */

/** @type {ProductoFila[]} */
let productos = [
  { nombre: '5 Piezas Lat Pulldown Attachment', sku: 'C-AG-LAT-0001' },
  { nombre: 'Banca Multiposiciones All Black', sku: 'C-BA-MUL-0001' },
  { nombre: 'Banca Multiposiciones Logo Design', sku: 'C-BA-MUL-0002' },
  { nombre: 'Banca Multiposiciones Generica', sku: 'C-BA-MUL-0003' },
  { nombre: 'Barra Z 20 lbs', sku: 'C-BA-OLI-0200' },
  { nombre: 'BB Casco', sku: 'C-BB-DIS-0001' },
  { nombre: 'BB No Pain No Gain', sku: 'C-BB-DIS-0002' },
  { nombre: 'BB Savage', sku: 'C-BB-DIS-0003' },
  { nombre: 'Par Discos 2.5 kg', sku: 'C-DI-KGS-0025' },
  { nombre: 'Par Discos 5 kg', sku: 'C-DI-KGS-0050' },
  { nombre: 'Par Discos 10 kg', sku: 'C-DI-KGS-0100' },
  { nombre: 'Par Discos 15kg', sku: 'C-DI-KGS-0150' },
  { nombre: 'Par Discos 15kg', sku: 'C-DI-KGS-0200' },
  { nombre: 'Kit 4 Discos 2.5 kg', sku: 'C-DI-KIT-0025' },
  { nombre: 'Kit 4 Discos 5 kg', sku: 'C-DI-KIT-0050' },
  { nombre: 'Par Discos 2.5 lbs', sku: 'C-DI-LBS-0025' },
  { nombre: 'Par Discos 5 lbs', sku: 'C-DI-LBS-0050' },
  { nombre: 'Par Discos 10 lbs', sku: 'C-DI-LBS-0100' },
  { nombre: 'Par Discos 35 lbs', sku: 'C-DI-LBS-0350' },
  { nombre: 'Par Mancuernas Hexagonal10lb', sku: 'C-MA-LBS-0010' },
  { nombre: 'Par Mancuernas Hexagonal 3lb', sku: 'C-MA-LBS-0030' },
  { nombre: 'Par Mancuernas Hexagonal 5lb', sku: 'C-MA-LBS-0050' },
  { nombre: 'Par Mancuernas Hexagonal 15lb', sku: 'C-MA-LBS-0150' },
  { nombre: 'Swiss Ball 20lb', sku: 'C-SB-LBS-0200' },
  { nombre: 'Floor Tiles Mármol Carrara', sku: 'H-FT-BAS-0001' },
  { nombre: 'Floor Tiles Mármol Marquina', sku: 'H-FT-BAS-0002' },
  { nombre: 'Floor Tiles Mármol Ceniza', sku: 'H-FT-BAS-0003' },
  { nombre: 'Floor Tiles Mármol Gris', sku: 'H-FT-BAS-0004' },
  { nombre: 'Floor Tiles Pino Miel', sku: 'H-FT-BAS-0005' },
  { nombre: 'Floor Tiles Sombra Nogal', sku: 'H-FT-BAS-0006' },
  { nombre: 'Piso Hanie Design Parquet Gold', sku: 'H-PI-HDP-0001' },
  { nombre: 'Piso Hanie Design Vertical Cafe', sku: 'H-PI-HDP-0003' },
  { nombre: 'Piso Deck Parquet Gold', sku: 'H-PI-PAR-0003' },
  { nombre: 'Piso Deck Parquet Café', sku: 'H-PI-PAR-0004' },
  { nombre: 'Piso Deck Vertical Gold', sku: 'H-PI-VER-0001' },
  { nombre: 'Piso Deck Vertical Café', sku: 'H-PI-VER-0002' },
  { nombre: 'Wall Panel Arena Fina', sku: 'H-WP-RAY-0001' },
  { nombre: 'Wall Panel Bambú Claro', sku: 'H-WP-RAY-0002' },
  { nombre: 'Wall Panel Pino Nórdico', sku: 'H-WP-RAY-0003' },
  { nombre: 'Wall Panel Gris Carbón', sku: 'H-WP-RAY-0004' },
  { nombre: 'Wall Panel Pino Nogal', sku: 'H-WP-RAY-0005' },
  { nombre: 'Wall Tiles Verde Esmeralda', sku: 'H-WT-COL-0001' },
  { nombre: 'Wall Tiles Ceniza Volcánica', sku: 'H-WT-COL-0002' },
  { nombre: 'Wall Tiles Gris Ártico', sku: 'H-WT-COL-0003' },
  { nombre: 'Wall Tiles Desierto Crema', sku: 'H-WT-COL-0004' },
  { nombre: 'Wall Tiles Rosa Antigua', sku: 'H-WT-COL-0005' },
  { nombre: 'Wall Tiles Caoba Rústica', sku: 'H-WT-COL-0006' },
  { nombre: 'Wall Tiles Ónix Negro', sku: 'H-WT-COL-0007' },
  { nombre: 'Wall Tiles Azul Noche', sku: 'H-WT-COL-0008' },
  { nombre: 'Wall Tiles Verde Selva', sku: 'H-WT-CUA-0009' },
  { nombre: 'Wall Tiles Lima Fresca', sku: 'H-WT-CUA-0010' },
  { nombre: 'Wall Tiles Tierra Mojave', sku: 'H-WT-CUA-0011' },
  { nombre: 'Wall Tiles Jade Sereno', sku: 'H-WT-CUA-0012' },
  { nombre: 'Wall Tiles Hexágono Gris', sku: 'H-WT-HEX-0017' },
  { nombre: 'Wall Tiles Hexágono Glaciar', sku: 'H-WT-HEX-0018' },
  { nombre: 'Wall Tiles Hexágono Marmol Terracota', sku: 'H-WT-HEX-0019' },
  { nombre: 'Wall Tiles Mármol Carrara', sku: 'H-WT-LAD-0020' },
  { nombre: 'Wall Tiles Mármol Nube', sku: 'H-WT-LAD-0021' },
  { nombre: 'Wall Tiles Mármol Roca', sku: 'H-WT-LAD-0022' },
  { nombre: 'Wall Tiles Halo Gris', sku: 'H-WT-LAD-0023' },
  { nombre: 'Wall Tiles Halo Blanco', sku: 'H-WT-LAD-0024' },
  { nombre: 'Wall Tiles Nube Clara', sku: 'H-WT-LAD-0025' },
  { nombre: 'Wall Tiles Piedra Alpina', sku: 'H-WT-LAD-0026' },
  { nombre: 'Wall Tiles Jade Urbano', sku: 'H-WT-LAD-0027' },
  { nombre: 'Wall Tiles Subway Perla', sku: 'H-WT-SUB-0013' },
  { nombre: 'Wall Tiles Subway Verde Olivo', sku: 'H-WT-SUB-0014' },
  { nombre: 'Wall Tiles Subway Blanco', sku: 'H-WT-SUB-0015' },
  { nombre: 'Wall Tiles Subway Ártico', sku: 'H-WT-SUB-0016' },
  { nombre: 'Par Mancuernas Hexagonal 5lb', sku: 'C-MC-HEX-0050' },
  { nombre: 'Barra Z 20 Lbs con bujes', sku: null },
  { nombre: 'Par Mancuernas Hexagonal 10lb', sku: 'C-MC-HEX-0100' },
  { nombre: 'Par Mancuernas Hexagonal 15lb', sku: 'C-MC-HEX-0150' },
  { nombre: 'Par Mancuernas Hexagonal 20lb', sku: 'C-MC-HEX-0200' },
  { nombre: 'Par Mancuernas Hexagonal 25lb', sku: 'C-MC-HEX-0250' },
  { nombre: 'Par Mancuernas Hexagonal 30lb', sku: 'C-MC-HEX-0300' },
];

loadFromStorage();

export function getProductos() {
  return productos;
}

export function setProductosExcelFilas(filas) {
  productos = filas || [];
  saveToStorage();
}

/**
 * Mezcla datos del CSV/XLSX de MeLi en las filas existentes por SKU (codigoMl o sku).
 * Cada objeto en meliFilas debe tener al menos sku o codigoMl; el resto de campos se guardan en la fila.
 * @param {Record<string, unknown>[]} meliFilas - Array de objetos con claves del esquema MeLi
 */
export function mergeMeliDataPorSku(objetoMeli) {
  for (const producto of productos) {
    if (producto.sku === objetoMeli.sku) {
      producto.mercadolibre = objetoMeli.unidadesEnFullAptasVender;
      const total = Number(producto.total) + Number(objetoMeli.unidadesEnFullAptasVender);
      producto.total = total;
    }
  }
  saveToStorage();
}

/**
 * Mezcla datos del CSV/XLSX de MeLi en las filas existentes por SKU (codigoMl o sku).
 * Cada objeto en meliFilas debe tener al menos sku o codigoMl; el resto de campos se guardan en la fila.
 * @param {Record<string, unknown>[]} meliFilas - Array de objetos con claves del esquema MeLi
 */
export function mergeAmzDataPorSku(objetoAmz) {
  for (const producto of productos) {
    if (producto.sku === objetoAmz.sku) {
      producto.amazon = objetoAmz.inventorySupplyAtFba;
      const total = Number(producto.total) + Number(producto.amazon);
      producto.total = total;
    }
  }
  saveToStorage();
}
