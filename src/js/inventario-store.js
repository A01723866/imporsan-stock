/**
 * Estado del inventario entre páginas.
 *
 * Guarda en sessionStorage el inventario que devuelve el backend por cada
 * plataforma. El formato es un objeto plano que se puede serializar a JSON:
 *
 *   {
 *     mercadolibre: { "C-BB-DIS-0001": 42, "H-WT-LAD-0022": 17 },
 *     amazon:       { "C-BB-DIS-0001": 5 },
 *     spakio:       { "H-WT-LAD-0022": 30 },
 *   }
 *
 * Solo los SKUs encontrados en el archivo aparecen en el dict; los que no
 * aparecen se asumen en 0. La página de productos combina este estado con
 * el catálogo para armar la tabla completa.
 *
 * sessionStorage (no localStorage) asegura que los datos se limpian al
 * cerrar el tab, evitando que inventario viejo aparezca en sesiones nuevas.
 */

const CLAVE_STORAGE = 'imporsan-inventario-v2';

/** @typedef {{ mercadolibre: Record<string,number>, amazon: Record<string,number>, spakio: Record<string,number> }} InventarioCombinado */

/** Estado vacío por defecto. */
function estadoVacio() {
  return { mercadolibre: {}, amazon: {}, spakio: {} };
}

/**
 * Lee el inventario completo desde sessionStorage.
 * Si no hay datos guardados, retorna un estado vacío.
 *
 * @returns {InventarioCombinado}
 */
export function leerInventario() {
  try {
    const raw = sessionStorage.getItem(CLAVE_STORAGE);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* sesión corrupta, empezar de cero */ }
  return estadoVacio();
}

/**
 * Reemplaza el inventario de UNA plataforma y persiste el estado.
 *
 * Cada vez que el usuario sube un archivo nuevo, el inventario de esa
 * plataforma se reemplaza completo (no se acumula sobre el anterior).
 *
 * @param {'mercadolibre' | 'amazon' | 'spakio'} plataforma
 * @param {Record<string, number>} inventario  Resultado de la API: { sku: stock }
 */
export function guardarInventario(plataforma, inventario) {
  const estado = leerInventario();
  estado[plataforma] = inventario;
  try {
    sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
  } catch (_) { /* sessionStorage lleno, continuar sin guardar */ }
}

/**
 * Borra todo el inventario guardado.
 * Útil para empezar una sesión de carga limpia.
 */
export function limpiarInventario() {
  sessionStorage.removeItem(CLAVE_STORAGE);
}
