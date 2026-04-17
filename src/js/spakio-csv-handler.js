import Papa from 'papaparse';
import { mergeSpakioDataPorSku, resetSpakioInventario } from './productos-excel-data.js';

const config = {
    delimiter: "",	// auto-detect
    newline: "",	// auto-detect
    quoteChar: '"',
    escapeChar: '"',
    header: false,
    transformHeader: undefined,
    dynamicTyping: false,
    preview: 0,
    encoding: "",
    worker: false,
    comments: false,
    step: undefined,
    complete: undefined,
    error: undefined,
    download: false,
    downloadRequestHeaders: undefined,
    downloadRequestBody: undefined,
    skipEmptyLines: false,
    chunk: undefined,
    chunkSize: undefined,
    fastMode: undefined,
    beforeFirstChunk: undefined,
    withCredentials: undefined,
    transform: undefined,
    delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP],
    skipFirstNLines: 1
}
export const SPAKIO_FILA_ATRIBUTOS = [
    'objectType',       // 1. ProductType
    'relatedParent',    // 2. RelatedParent
    'id',               // 3. id
    'name',             // 4. name
    'description',      // 5. description
    'storageSku',       // 6. storageSku
    'storageName',      // 7. storageName
    'storageId',        // 8. storageId
    'productType',      // 9. productType
    'totalStock',       // 10. totalStock
    'totalVolumne'      // 11. totalVolumne
];

/** Objeto vacío con todos los atributos (mismo orden que MELI_FILA_ATRIBUTOS). */
export function crearObjetoSpakioVacio() {
    return SPAKIO_FILA_ATRIBUTOS.reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, /** @type {Record<string, unknown>} */ ({}));
  }
  
/** Llena el objeto con los valores de la fila */
function llenarObjetoSpakioFila(rows) {
      const objetoSpakio = crearObjetoSpakioVacio();
      for (let i = 0; i < rows.length; i++) {
          objetoSpakio[SPAKIO_FILA_ATRIBUTOS[i]] = rows[i];
      }
      return objetoSpakio;
}

async function handleSpakio(file) {
    resetSpakioInventario();
    const arrayBuffer = await file.arrayBuffer();
    const result = await new Promise((resolve, reject) => {
        Papa.parse(file, {
            ...config,
            complete: (res) => resolve(res),
            error: (err) => reject(err),
        });
    });
    const rows = result.data;
    if (!rows || !Array.isArray(rows)) return result;
    for (const row of rows) {
        const objetoSpakio = llenarObjetoSpakioFila(row);
        await mergeSpakioDataPorSku(objetoSpakio);
    }
}

export default handleSpakio;