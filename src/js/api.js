/**
 * Cliente HTTP del backend de Imporsan Stock.
 *
 * Toda la comunicación con el backend pasa por este archivo.
 * Si la URL del backend cambia, solo hay que tocar VITE_API_URL en el .env.
 *
 * URL base:
 *   - Desarrollo:  http://localhost:8000  (o lo que diga VITE_API_URL)
 *   - Producción:  definir VITE_API_URL en las variables de entorno del host
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

/**
 * Envía el archivo de una plataforma al backend y retorna el inventario extraído.
 *
 * @param {'mercadolibre' | 'amazon' | 'spakio'} plataforma
 * @param {File} archivo
 * @returns {Promise<{ plataforma: string, inventario: Record<string, number>, productos_encontrados: number }>}
 * @throws {Error} Si el servidor rechaza el archivo o no está disponible.
 */
export async function subirArchivo(plataforma, archivo) {
  const formData = new FormData();
  formData.append('archivo', archivo);

  const respuesta = await fetch(`${API_BASE}/api/stock-actual/upload/${plataforma}`, {
    method: 'POST',
    body: formData,
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => ({}));
    throw new Error(detalle?.detail ?? `Error ${respuesta.status} al procesar el archivo.`);
  }

  return respuesta.json();
}

/**
 * Obtiene el catálogo base de productos (solo SKU y nombre).
 *
 * @returns {Promise<Array<{ sku: string, nombre: string }>>}
 */
export async function obtenerProductos() {
  const respuesta = await fetch(`${API_BASE}/api/productos`);
  if (!respuesta.ok) throw new Error('No se pudo cargar el catálogo de productos.');
  return respuesta.json();
}


// ---------------------------------------------------------------------------
// Movimientos (módulo CRUD)
// ---------------------------------------------------------------------------
//
// Helpers genéricos para no repetir el patrón fetch+ok+json en cada función.

async function pedirJson(url, opciones) {
  const respuesta = await fetch(url, opciones);
  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => ({}));
    throw new Error(detalle?.detail ?? `Error ${respuesta.status} al llamar ${url}.`);
  }
  // 204 No Content (delete)
  if (respuesta.status === 204) return null;
  return respuesta.json();
}

const opcionesJson = (metodo, body) => ({
  method: metodo,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});


// ----- movimientos -----

export const obtenerMovimientos = () =>
  pedirJson(`${API_BASE}/api/movimientos`);

export const obtenerMovimiento = (id) =>
  pedirJson(`${API_BASE}/api/movimientos/${id}`);

export const crearMovimiento = (datos) =>
  pedirJson(`${API_BASE}/api/movimientos`, opcionesJson('POST', datos));

export const actualizarMovimiento = (id, cambios) =>
  pedirJson(`${API_BASE}/api/movimientos/${id}`, opcionesJson('PATCH', cambios));

export const eliminarMovimiento = (id) =>
  pedirJson(`${API_BASE}/api/movimientos/${id}`, { method: 'DELETE' });


// ----- estados (catálogo) -----

export const obtenerEstados = () =>
  pedirJson(`${API_BASE}/api/movimientos/estados`);


// ----- costo_tipo (catálogo) -----

export const obtenerCostoTipos = () =>
  pedirJson(`${API_BASE}/api/movimientos/costo-tipo`);


// ----- mov_prod (productos del movimiento) -----

export const obtenerMovProd = (idMovimiento) => {
  const url = idMovimiento
    ? `${API_BASE}/api/movimientos/productos?id_movimiento=${encodeURIComponent(idMovimiento)}`
    : `${API_BASE}/api/movimientos/productos`;
  return pedirJson(url);
};

export const crearMovProd = (datos) =>
  pedirJson(`${API_BASE}/api/movimientos/productos`, opcionesJson('POST', datos));

export const actualizarMovProd = (id, cambios) =>
  pedirJson(`${API_BASE}/api/movimientos/productos/${id}`, opcionesJson('PATCH', cambios));

export const eliminarMovProd = (id) =>
  pedirJson(`${API_BASE}/api/movimientos/productos/${id}`, { method: 'DELETE' });


// ----- mov_costo (costos del movimiento) -----

export const obtenerMovCosto = (idMovimiento) => {
  const url = idMovimiento
    ? `${API_BASE}/api/movimientos/costos?id_movimiento=${encodeURIComponent(idMovimiento)}`
    : `${API_BASE}/api/movimientos/costos`;
  return pedirJson(url);
};

export const crearMovCosto = (datos) =>
  pedirJson(`${API_BASE}/api/movimientos/costos`, opcionesJson('POST', datos));

export const eliminarMovCosto = (id) =>
  pedirJson(`${API_BASE}/api/movimientos/costos/${id}`, { method: 'DELETE' });
