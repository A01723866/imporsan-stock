/**
 * Fuente única de verdad para la tabla de productos.
 * Persiste en sessionStorage al cambiar; al cargar cualquier página se restaura desde ahí.
 */

const IMPOR_SAN_PRODUCTOS_STORAGE_KEY = 'impor-san-productos-excel-filas';
import getProducts from './pulldata.js'
const productosDB = await getProducts();
import Papa from 'papaparse';

function findSkuByModelo(modelo) {
  for (const rowDB of productosDB) {
    if (rowDB.modelo === modelo && rowDB.sku) {
      return rowDB.sku;
    }
  }
  return null;
}

function mapRollos(){
  const rollos = {
    'Bambu claro': 'H-WP-RAY-0002',
    'Gris carbon': 'H-WP-RAY-0004',
    'Pino nogal': 'H-WP-RAY-0005'
  }
  return rollos;
}

function mapNULL(){
  const nulls = {
    'Parquet Gold': 'H-PI-PAR-0003',
    'Parquet Cafe': 'H-PI-PAR-0004',
    'Vertical Cafe': 'H-PI-PAR-0002',
    'Vertical Gold': 'H-PI-PAR-0001',
    'Barra curl olympic': 'C-BA-OLI-0200',
    'Kit de 5 pares de discos de pesas de 2.5 LB': 'C-DI-LBS-0025',
    'Kit de 5 pares de discos de pesas de 5 LB': 'C-DI-LBS-0050',
    'Kit de par de discos de pesas de 5 kg': 'C-DI-KGS-0050',
    'Kit de 2 pares de discos de pesas de 10 LB': 'C-DI-LBS-0100',
    'Kit de par de discos de pesaa de 10 kg': 'C-DI-KGS-0100'
  }
  return nulls;
}

function mapKits(){
  const kits = {
    'C-DI-LBS-0025': 5,
    'C-DI-LBS-0050': 5,
    'C-DI-LBS-0100': 2,
    'C-DI-KGS-0100': 1
  }
  return kits;
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
}

/** @typedef {{ nombre: string, sku: string|null, mercadolibre?: string, amazon?: string, spakio?: string, total?: string }} ProductoFila */

/** @type {ProductoFila[]} */
let productos = [
  { nombre: '5 Piezas Lat Pulldown Attachment', sku: 'C-AG-LAT-0001', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Banca Multiposiciones All Black', sku: 'C-BA-MUL-0001', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Banca Multiposiciones Logo Design', sku: 'C-BA-MUL-0002', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Banca Multiposiciones Generica', sku: 'C-BA-MUL-0003', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Barra Z 20 lbs', sku: 'C-BA-OLI-0200', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'BB Casco', sku: 'C-BB-DIS-0001', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'BB No Pain No Gain', sku: 'C-BB-DIS-0002', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'BB Savage', sku: 'C-BB-DIS-0003', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 2.5 kg', sku: 'C-DI-KGS-0025', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 5 kg', sku: 'C-DI-KGS-0050', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 10 kg', sku: 'C-DI-KGS-0100', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 15kg', sku: 'C-DI-KGS-0150', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 15kg', sku: 'C-DI-KGS-0200', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Kit 4 Discos 2.5 kg', sku: 'C-DI-KIT-0025', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Kit 4 Discos 5 kg', sku: 'C-DI-KIT-0050', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 2.5 lbs', sku: 'C-DI-LBS-0025', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 5 lbs', sku: 'C-DI-LBS-0050', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 10 lbs', sku: 'C-DI-LBS-0100', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Discos 35 lbs', sku: 'C-DI-LBS-0350', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal10lb', sku: 'C-MA-LBS-0010', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 3lb', sku: 'C-MA-LBS-0030', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 5lb', sku: 'C-MA-LBS-0050', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 15lb', sku: 'C-MA-LBS-0150', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Swiss Ball 20lb', sku: 'C-SB-LBS-0200', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Mármol Carrara', sku: 'H-FT-BAS-0001', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Mármol Marquina', sku: 'H-FT-BAS-0002', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Mármol Ceniza', sku: 'H-FT-BAS-0003', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Mármol Gris', sku: 'H-FT-BAS-0004', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Pino Miel', sku: 'H-FT-BAS-0005', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Floor Tiles Sombra Nogal', sku: 'H-FT-BAS-0006', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Piso Hanie Design Parquet Gold', sku: 'H-PI-HDP-0001', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Piso Hanie Design Vertical Cafe', sku: 'H-PI-HDP-0003', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
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
  { nombre: 'Wall Tiles Subway Ártico', sku: 'H-WT-SUB-0016', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 5lb', sku: 'C-MC-HEX-0050', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Barra Z 20 Lbs con bujes', sku: null, mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 10lb', sku: 'C-MC-HEX-0100', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 15lb', sku: 'C-MC-HEX-0150', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 20lb', sku: 'C-MC-HEX-0200', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 25lb', sku: 'C-MC-HEX-0250', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
  { nombre: 'Par Mancuernas Hexagonal 30lb', sku: 'C-MC-HEX-0300', mercadolibre: 0, amazon: 0, spakio: 0, total: 0 },
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
    }
  }
  saveToStorage();
}

export async function mergeSpakioDataPorSku(objetoSpakio) {
  const name = objetoSpakio?.name;
  const preProductmodelo = typeof name === 'string' ? name.split('(')[1] : undefined;
  const productmodelo = preProductmodelo != null ? preProductmodelo.split(')')[0] : null;
  const onlyName = name.split('(')[0];
  if (productmodelo == null){
    console.log('NULL',name);
    const sku = mapNULL()[name];
    for (const producto of productos) {
      if (producto.sku === sku) {
        let multiplier = 1;
        if (mapKits()[producto.sku]) {
          multiplier = mapKits()[producto.sku];
        }
        producto.spakio = String(objetoSpakio.totalStock ?? '') * multiplier;
        break;
      }
    }  
  }
  else if (productmodelo === 'Rollo') {
    const sku = mapRollos()[onlyName];
    for (const producto of productos) {
      if (producto.sku === sku) {
        producto.spakio = String(objetoSpakio.totalStock ?? '');
        break;
      }
    }
    
  }
  else{
    const sku = findSkuByModelo(productmodelo);
    for (const producto of productos) {
      if (producto.sku === sku) {
        producto.spakio = String(objetoSpakio.totalStock ?? '');
        break;
      }
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