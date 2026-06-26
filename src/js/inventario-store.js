/**
 * Estado del inventario entre páginas.
 *
 * Guarda en sessionStorage el inventario que devuelve el backend por cada
 * plataforma. Solo los SKUs encontrados aparecen; los que no, se asumen en 0.
 *
 * sessionStorage (no localStorage) asegura que los datos se limpian al
 * cerrar el tab.
 */

const CLAVE_STORAGE = 'imporsan-inventario-v2';

/** @typedef {{ mercadolibre: Record<string,number>, amazon: Record<string,number>, amazon_reserva: Record<string,number>, almacen_mty: Record<string,number>, almacen_tulti: Record<string,number> }} InventarioCombinado */

function estadoVacio() {
  return { mercadolibre: {}, amazon: {}, amazon_reserva: {}, almacen_mty: {}, almacen_tulti: {} };
}

/** @returns {InventarioCombinado} */
export function leerInventario() {
  try {
    const raw = sessionStorage.getItem(CLAVE_STORAGE);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* sesión corrupta, empezar de cero */ }
  return estadoVacio();
}

/** @param {string} plataforma @param {Record<string, number>} inventario */
export function guardarInventario(plataforma, inventario) {
  const estado = leerInventario();
  estado[plataforma] = inventario;
  try {
    sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
  } catch (_) { /* sessionStorage lleno, continuar sin guardar */ }
}

export function limpiarInventario() {
  sessionStorage.removeItem(CLAVE_STORAGE);
}
