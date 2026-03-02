import Papa from 'papaparse';
import { mergeAmzDataPorSku } from './productos-excel-data.js';

/**
 * Atributos de cada fila del XLSX de amz, en el mismo orden que las columnas.
 * Para crear un objeto por fila: row.forEach((val, i) => obj[amz_FILA_ATRIBUTOS[i]] = val).
 * Para el JSON final: array de esos objetos (un objeto por fila del archivo).
 */
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
        skipFirstNLines: 0
    }
export const AMZ_FILA_ATRIBUTOS = [
  'snapshotDate',                              // 1. snapshot-date
  'sku',                                       // 2. sku
  'fnsku',                                     // 3. fnsku
  'asin',                                      // 4. asin
  'productName',                               // 5. product-name
  'condition',                                 // 6. condition
  'available',                                 // 7. available
  'pendingRemovalQuantity',                    // 8. pending-removal-quantity
  'invAge0To90Days',                           // 9. inv-age-0-to-90-days
  'invAge91To180Days',                         // 10. inv-age-91-to-180-days
  'invAge181To270Days',                        // 11. inv-age-181-to-270-days
  'invAge271To365Days',                        // 12. inv-age-271-to-365-days
  'invAge365PlusDays',                         // 13. inv-age-365-plus-days
  'currency',                                  // 14. currency
  'qtyToBeChargedLtsf6Mo',                     // 15. qty-to-be-charged-ltsf-6-mo
  'projectedLtsf6Mo',                          // 16. projected-ltsf-6-mo
  'qtyToBeChargedLtsf12Mo',                    // 17. qty-to-be-charged-ltsf-12-mo
  'estimatedLtsfNextCharge',                    // 18. estimated-ltsf-next-charge
  'unitsShippedT7',                            // 19. units-shipped-t7
  'unitsShippedT30',                           // 20. units-shipped-t30
  'unitsShippedT60',                           // 21. units-shipped-t60
  'unitsShippedT90',                           // 22. units-shipped-t90
  'alert',                                     // 23. alert
  'yourPrice',                                 // 24. your-price
  'salesPrice',                                // 25. sales-price
  'lowestPriceNewPlusShipping',                 // 26. lowest-price-new-plus-shipping
  'lowestPriceUsed',                           // 27. lowest-price-used
  'recommendedAction',                         // 28. recommended-action
  'sellThrough',                               // 29. sell-through
  'itemVolume',                                // 30. item-volume
  'volumeUnitMeasurement',                     // 31. volume-unit-measurement
  'storageType',                               // 32. storage-type
  'storageVolume',                             // 33. storage-volume
  'marketplace',                               // 34. marketplace
  'productGroup',                              // 35. product-group
  'salesRank',                                 // 36. sales-rank
  'daysOfSupply',                              // 37. days-of-supply
  'estimatedExcessQuantity',                   // 38. estimated-excess-quantity
  'weeksOfCoverT30',                           // 39. weeks-of-cover-t30
  'weeksOfCoverT90',                           // 40. weeks-of-cover-t90
  'featuredofferPrice',                        // 41. featuredoffer-price
  'salesShippedLast7Days',                     // 42. sales-shipped-last-7-days
  'salesShippedLast30Days',                    // 43. sales-shipped-last-30-days
  'salesShippedLast60Days',                    // 44. sales-shipped-last-60-days
  'salesShippedLast90Days',                    // 45. sales-shipped-last-90-days
  'invAge0To30Days',                           // 46. inv-age-0-to-30-days
  'invAge31To60Days',                          // 47. inv-age-31-to-60-days
  'invAge61To90Days',                          // 48. inv-age-61-to-90-days
  'invAge181To330Days',                        // 49. inv-age-181-to-330-days
  'invAge331To365Days',                        // 50. inv-age-331-to-365-days
  'estimatedStorageCostNextMonth',              // 51. estimated-storage-cost-next-month
  'inboundQuantity',                           // 52. inbound-quantity
  'inboundWorking',                            // 53. inbound-working
  'inboundShipped',                             // 54. inbound-shipped
  'inboundReceived',                            // 55. inbound-received
  'inventoryAgeSnapshotDate',                  // 56. Inventory age snapshot date
  'inventorySupplyAtFba',                      // 57. Inventory Supply at FBA
  'reservedFcTransfer',                        // 58. Reserved FC Transfer
  'reservedFcProcessing',                      // 59. Reserved FC Processing
  'reservedCustomerOrder',                     // 60. Reserved Customer Order
  'totalDaysOfSupplyIncludingUnitsFromOpenShipments', // 61. Total Days of Supply (including units from open shipments)
];

/** Objeto vacío con todos los atributos (mismo orden que amz_FILA_ATRIBUTOS). */
export function crearObjetoamzFilaVacio() {
  return AMZ_FILA_ATRIBUTOS.reduce((acc, key) => {
    acc[key] = null;
    return acc;
  }, /** @type {Record<string, unknown>} */ ({}));
}

/** Llena el objeto con los valores de la fila */
function llenarObjetoamzFila(rows) {
    const objetoamz = crearObjetoamzFilaVacio();
    for (let i = 0; i < rows.length; i++) {
        objetoamz[AMZ_FILA_ATRIBUTOS[i]] = rows[i];
    }
    return objetoamz;
}

async function handleamz(file) {
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
        const objetoamz = llenarObjetoamzFila(row);
        mergeAmzDataPorSku(objetoamz);
    }
    return result;
}

export default handleamz;