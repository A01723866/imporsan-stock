/**
 * Fuente única de verdad para la tabla de productos.
 * Persiste en sessionStorage al cambiar; al cargar cualquier página se restaura desde ahí.
 */

const IMPOR_SAN_PRODUCTOS_STORAGE_KEY = 'impor-san-productos-excel-filas';
import Papa from 'papaparse';
const productosChangeListeners = new Set();

const MAP_SKU_ANTIGUO = {
  'MT1024':   'H-WT-LAD-0022',
  'MT1224A':  'H-WT-LAD-0024',
  'MT1250A':  'H-WT-HEX-0019',
  'MT1175A':  'H-WT-HEX-0017',
  'MT1190A':  'H-WT-HEX-0018',
  'MT1390-30':'H-WT-COL-0002',
  'MT1038A':  'H-WT-LAD-0025',
  'MT1387':   'H-WT-COL-0006',
  'MT1385-30':'H-WT-COL-0005',
  'MT1329':   'H-WT-SUB-0015',
  'MT1330':   'H-WT-SUB-0016',
  'MT1346':   'H-WT-CUA-0009',
  'MT1386':   'H-WT-COL-0008',
  'X004R6G2VP':'H-WT-LAD-0026',
};

// { sku, mult } — mult se aplica al totalStock del producto en Spakio
const MAP_NOMBRE_SPAKIO = {
  'Vertical gold':                          { sku: 'H-PI-VER-0001', mult: 1 },
  'Parquet Gold':                           { sku: 'H-PI-PAR-0003', mult: 1 },
  'Parquet Cafe':                           { sku: 'H-PI-PAR-0004', mult: 1 },
  'Vertical Cafe':                          { sku: 'H-PI-VER-0002', mult: 1 },
  'Gris carbon(Rollo)':                     { sku: 'H-WP-RAY-0004', mult: 1 },
  'Pino nogal(Rollo)':                      { sku: 'H-WP-RAY-0005', mult: 1 },
  'Bambu claro(Rollo)':                     { sku: 'H-WP-RAY-0002', mult: 1 },
  'Kit de par de discos de pesas de 10 kg': { sku: 'C-DI-KGS-0100', mult: 1 },
  'Kit de 2 pares de pesas de 2.5kg5.5LB': { sku: 'C-DI-KGS-0025', mult: 2 },
  'Kit de 2 pares de pesas de 2.5KG':      { sku: 'C-DI-KGS-0025', mult: 2 },
  'KIT de 2 pares de pesas de 5Kg':        { sku: 'C-DI-KGS-0050', mult: 2 },
  'par de pesas de 2.5KG':                 { sku: 'C-DI-KGS-0025', mult: 1 },
  'Par de pesas de 10 LB':                 { sku: 'C-DI-LBS-0100', mult: 1 },
  'Par de discos de 10LB':                 { sku: 'C-DI-LBS-0100', mult: 1 },
  'Kit de 5 pares de discos de 2.5 LB':   { sku: 'C-DI-LBS-0025', mult: 5 },
  'Kit de 5 pares de discos de 5 LB':     { sku: 'C-DI-LBS-0050', mult: 5 },
  'Barra curl olympic':                    { sku: 'C-BA-OLI-0200', mult: 1 },
};

const MAP_MULT_SKU_NUEVO = {
  'C-BB-DIS-0001': 10,
  'C-BB-DIS-0002': 10,
  'C-BB-DIS-0003': 10,
};

// KIT SKUs que deben sumarse al stock del producto base en plataformas
const MAP_KIT_A_BASE = {
  'C-DI-KIT-0025': 'C-DI-KGS-0025',
  'C-DI-KIT-0050': 'C-DI-KGS-0050',
};

function extractNuevoSku(name) {
  const match = name.match(/[A-Z]-[A-Z]{2}-[A-Z]{3}-\d{4}/);
  return match ? match[0] : null;
}

function extractSkuAntiguo(name) {
  const match = name.match(/\((MT[\w-]+|X[\w]+)\)/);
  return match ? match[1] : null;
}

export function loadFromStorage() {
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
  notifyProductosChangeListeners();
}

function getProductosSnapshot() {
  return productos.map((filaProducto) => ({ ...filaProducto }));
}

function notifyProductosChangeListeners() {
  const productosSnapshot = getProductosSnapshot();
  for (const listener of productosChangeListeners) {
    listener(productosSnapshot);
  }
}

/** @typedef {{ nombre: string, sku: string|null, mercadolibre?: string, amazon?: string, spakio?: string, total?: string }} ProductoFila */

/** @type {ProductoFila[]} */
let productos = [
  { nombre: 'Barra Z 20 lbs', sku: 'C-BA-OLI-0200', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Barra Z (6.3kg) con bujes', sku: 'C-BA-OLI-0210' , mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'BB Casco', sku: 'C-BB-DIS-0001', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'BB No Pain No Gain', sku: 'C-BB-DIS-0002', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'BB Savage', sku: 'C-BB-DIS-0003', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 2.5 kg', sku: 'C-DI-KGS-0025', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 5 kg', sku: 'C-DI-KGS-0050', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 10 kg', sku: 'C-DI-KGS-0100', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 15kg', sku: 'C-DI-KGS-0150', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 20kg', sku: 'C-DI-KGS-0200', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
{ nombre: 'Par Discos 2.5 lbs', sku: 'C-DI-LBS-0025', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 5 lbs', sku: 'C-DI-LBS-0050', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 10 lbs', sku: 'C-DI-LBS-0100', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 35 lbs', sku: 'C-DI-LBS-0350', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 5lb', sku: 'C-MC-HEX-0050', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 10lb', sku: 'C-MC-HEX-0100', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 15lb', sku: 'C-MC-HEX-0150', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 20lb', sku: 'C-MC-HEX-0200', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 25lb', sku: 'C-MC-HEX-0250', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 30lb', sku: 'C-MC-HEX-0300', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Mármol Carrara', sku: 'H-FT-BAS-0001', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Mármol Marquina', sku: 'H-FT-BAS-0002', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Mármol Ceniza', sku: 'H-FT-BAS-0003', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Mármol Gris', sku: 'H-FT-BAS-0004', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Pino Miel', sku: 'H-FT-BAS-0005', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Sombra Nogal', sku: 'H-FT-BAS-0006', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Piso Deck Parquet Gold', sku: 'H-PI-PAR-0003', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Piso Deck Parquet Café', sku: 'H-PI-PAR-0004', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Piso Deck Vertical Gold', sku: 'H-PI-VER-0001', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Piso Deck Vertical Café', sku: 'H-PI-VER-0002', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Panel Arena Fina', sku: 'H-WP-RAY-0001', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Panel Bambú Claro', sku: 'H-WP-RAY-0002', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Panel Pino Nórdico', sku: 'H-WP-RAY-0003', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Panel Gris Carbón', sku: 'H-WP-RAY-0004', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Panel Pino Nogal', sku: 'H-WP-RAY-0005', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Verde Esmeralda', sku: 'H-WT-COL-0001', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Ceniza Volcánica', sku: 'H-WT-COL-0002', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Gris Ártico', sku: 'H-WT-COL-0003', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Desierto Crema', sku: 'H-WT-COL-0004', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Rosa Antigua', sku: 'H-WT-COL-0005', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Caoba Rústica', sku: 'H-WT-COL-0006', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Ónix Negro', sku: 'H-WT-COL-0007', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Azul Noche', sku: 'H-WT-COL-0008', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Verde Selva', sku: 'H-WT-CUA-0009', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Lima Fresca', sku: 'H-WT-CUA-0010', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Tierra Mojave', sku: 'H-WT-CUA-0011', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Jade Sereno', sku: 'H-WT-CUA-0012', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Hexágono Gris', sku: 'H-WT-HEX-0017', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Hexágono Glaciar', sku: 'H-WT-HEX-0018', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Hexágono Marmol Terracota', sku: 'H-WT-HEX-0019', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Mármol Carrara', sku: 'H-WT-LAD-0020', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Mármol Nube', sku: 'H-WT-LAD-0021', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Mármol Roca', sku: 'H-WT-LAD-0022', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Halo Gris', sku: 'H-WT-LAD-0023', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Halo Blanco', sku: 'H-WT-LAD-0024', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Nube Clara', sku: 'H-WT-LAD-0025', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Piedra Alpina', sku: 'H-WT-LAD-0026', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Jade Urbano', sku: 'H-WT-LAD-0027', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Subway Perla', sku: 'H-WT-SUB-0013', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Subway Verde Olivo', sku: 'H-WT-SUB-0014', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Subway Blanco', sku: 'H-WT-SUB-0015', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Wall Tiles Subway Ártico', sku: 'H-WT-SUB-0016', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 }
];

loadFromStorage();

export function getProductos() {
  return productos;
}

export function subscribeToProductosChanges(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  productosChangeListeners.add(listener);
  listener(getProductosSnapshot());

  return () => {
    productosChangeListeners.delete(listener);
  };
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
  const skuBase = MAP_KIT_A_BASE[objetoMeli.sku] ?? objetoMeli.sku;
  const stock = Number(objetoMeli.unidadesEnFullAptasVender ?? 0);
  for (const producto of productos) {
    if (producto.sku === skuBase) {
      producto.mercadolibre = Number(producto.mercadolibre || 0) + stock;
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
  const skuBase = MAP_KIT_A_BASE[objetoAmz.sku] ?? objetoAmz.sku;
  const stock = Number(objetoAmz.inventorySupplyAtFba ?? 0);
  for (const producto of productos) {
    if (producto.sku === skuBase) {
      producto.amazon = Number(producto.amazon || 0) + stock;
    }
  }
  saveToStorage();
}

export function resetMeliInventario() {
  for (const producto of productos) {
    producto.mercadolibre = 0;
  }
}

export function resetAmazonInventario() {
  for (const producto of productos) {
    producto.amazon = 0;
  }
}

export function resetSpakioInventario() {
  for (const producto of productos) {
    producto.spakio = 0;
  }
}

export function mergeSpakioDataPorSku(objetoSpakio) {
  const name = objetoSpakio?.name;
  if (!name) return;

  const totalStock = Number(objetoSpakio.totalStock ?? 0);
  let sku = null;
  let mult = 1;

  // Método 1: SKU Nuevo embebido en el nombre (ej. "BB Savage C-BB-DIS-0003")
  const skuNuevo = extractNuevoSku(name);
  if (skuNuevo) {
    sku = skuNuevo;
    mult = MAP_MULT_SKU_NUEVO[skuNuevo] ?? 1;
  }

  // Método 2: Código antiguo entre paréntesis (ej. "Marmol Roca (MT1024)")
  if (!sku) {
    const codigoAntiguo = extractSkuAntiguo(name);
    if (codigoAntiguo && MAP_SKU_ANTIGUO[codigoAntiguo]) {
      sku = MAP_SKU_ANTIGUO[codigoAntiguo];
    }
  }

  // Método 3: Nombre exacto con multiplicador
  if (!sku) {
    const mapeo = MAP_NOMBRE_SPAKIO[name];
    if (mapeo) {
      sku = mapeo.sku;
      mult = mapeo.mult;
    }
  }

  if (!sku) return;

  for (const producto of productos) {
    if (producto.sku === sku) {
      producto.spakio = Number(producto.spakio || 0) + totalStock * mult;
      break;
    }
  }

  saveToStorage();
}

export function updateTotal() {
  for (const producto of productos) {
    const total = Number(producto.mercadolibre ?? 0 ) + Number(producto.amazon ?? 0 ) + Number(producto.spakio ?? 0 );
    producto.total = total;
  }
  saveToStorage();
}


const IMPOR_SAN_PRODUCTOS_EXCEL_EXPORT_FILENAME_PREFIX = 'imporsan-productos';

export function buildProductosExcelCsvString() {
  const productos = getProductos();
  console.log(productos);
  return Papa.unparse(productos, {
    skipEmptyLines: false,
  });
}

export function downloadProductosExcelCsv() {
  const csv = buildProductosExcelCsvString();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${IMPOR_SAN_PRODUCTOS_EXCEL_EXPORT_FILENAME_PREFIX}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.rel = 'noopener';
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);
}