import * as XLSX from 'xlsx';
import { mergeMeliDataPorSku } from './productos-excel-data.js';

/**
 * Atributos de cada fila del XLSX de MeLi, en el mismo orden que las columnas.
 * Para crear un objeto por fila: row.forEach((val, i) => obj[MELI_FILA_ATRIBUTOS[i]] = val).
 * Para el JSON final: array de esos objetos (un objeto por fila del archivo).
 */
export const MELI_FILA_ATRIBUTOS = [
  'codigoMl',           // 1. Código ML
  'codigoUniversal',    // 2. Código universal
  'sku',                // 3. SKU
  'numeroPublicacion',  // 4. # Publicación
  'agrupadorVariantes', // 5. Agrupador de variantes
  'producto',           // 6. Producto
  'tamano',             // 7. Tamaño
  'tipoProducto',       // 8. Tipo de producto
  'estadoPublicacion',  // 9. Estado de la publicación
  'ofreceFull',         // 10. Ofrece Full
  'ventasUltimos30Dias',// 11. Ventas últimos 30 días (u.)
  'unidadesAfectanMetricaAntiguedad',           // 12. Unidades que afectan la métrica "Con antigüedad"
  'unidadesEnCaminoFullPendientesIngreso',      // 13. Unidades en camino a Full - Pendientes de ingreso
  'unidadesEnCaminoFullEnTransferencia',        // 14. Unidades en camino a Full - En transferencia
  'unidadesEnFullDevueltasComprador',          // 15. Unidades en Full - Devueltas por el comprador
  'unidadesEnFullAptasVender',                  // 16. Unidades en Full - Aptas para vender
  'unidadesEnFullNoAptasVender',                // 17. Unidades en Full - No aptas para vender
  'unidadesEnFullTemporalmenteNoAptasExtraviadas',   // 18. Unidades en Full - Temporalmente no aptas - Extraviadas (en búsqueda)
  'unidadesEnFullTemporalmenteNoAptasEnRevision',    // 19. Unidades en Full - Temporalmente no aptas - En revisión
  'unidadesEnFullTemporalmenteNoAptasVentasCanceladas', // 20. Unidades en Full - Temporalmente no aptas - Ventas canceladas
  'unidadesOcupanEspacioFull',                  // 21. Unidades que ocupan espacio en Full
  'unidadesRecomendadasPendientesIngreso',      // 22. Unidades distribuidas por acción recomendada - Pendientes de ingreso
  'unidadesRecomendadasBuenaCalidad',           // 23. Unidades distribuidas por acción recomendada - Buena calidad
  'unidadesRecomendadasParaImpulsarVentas',     // 24. Unidades distribuidas por acción recomendada - Para impulsar ventas
  'unidadesRecomendadasParaPonerEnVenta',       // 25. Unidades distribuidas por acción recomendada - Para poner en venta
  'unidadesRecomendadasParaEvitarDescarte',     // 26. Unidades distribuidas por acción recomendada - Para evitar descarte
  'tiempoHastaAgotarStock',                     // 27. Tiempo hasta agotar stock
];

/** Objeto vacío con todos los atributos (mismo orden que MELI_FILA_ATRIBUTOS). */
export function crearObjetoMeliFilaVacio() {
  return MELI_FILA_ATRIBUTOS.reduce((acc, key) => {
    acc[key] = null;
    return acc;
  }, /** @type {Record<string, unknown>} */ ({}));
}

/** Llena el objeto con los valores de la fila */
function llenarObjetoMeliFila(rows) {
    const objetoMeli = crearObjetoMeliFilaVacio();
    for (let i = 0; i < rows.length; i++) {
        objetoMeli[MELI_FILA_ATRIBUTOS[i]] = rows[i];
    }
    return objetoMeli;
}

async function handleMeli(file) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false,
    });
    for (const row of rows) {
        const objetoMeli = llenarObjetoMeliFila(row);
        mergeMeliDataPorSku(objetoMeli);
    }
    return rows;
  }

export default handleMeli;