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

  const respuesta = await fetch(`${API_BASE}/api/upload/${plataforma}`, {
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
