/**
 * Dibuja la tabla de productos desde el array de objetos.
 * Llama a renderProductosExcelTabla() cada vez que cambien los datos (p. ej. tras mergeMeliDataPorSku).
 */


import { getProductos  } from './productos-excel-data.js';
console.log(getProductos());

const IMPOR_SAN_PRODUCTOS_TBODY_ID = 'impor-san-productos-excel-tbody';

function escapeHtml(text) {
  if (text == null || text === '') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Rellena el tbody de la tabla de productos con las filas del array.
 * Si no encuentra el tbody, no hace nada.
 */
export function renderProductosExcelTabla() {
  const tbody = document.getElementById(IMPOR_SAN_PRODUCTOS_TBODY_ID);
  if (!tbody) return;
  const filas = getProductos();
  tbody.innerHTML = filas
    .map((row, index) => {
      const num = index + 1;
      const nombre = escapeHtml(row.nombre);
      const sku = row.sku != null ? escapeHtml(String(row.sku)) : '';
      const ml = row.mercadolibre != null ? escapeHtml(String(row.mercadolibre)) : '';
      const amazon = row.amazon != null ? escapeHtml(String(row.amazon)) : '';
      const spakio = row.spakio != null ? escapeHtml(String(row.spakio)) : '';
      const total = row.total != null ? escapeHtml(String(row.total)) : '';
      return `<tr><th class="impor-san-excel-row-header" scope="row">${num}</th><td class="impor-san-excel-cell">${nombre}</td><td class="impor-san-excel-cell">${sku}</td><td class="impor-san-excel-cell">${ml}</td><td class="impor-san-excel-cell">${amazon}</td><td class="impor-san-excel-cell">${spakio}</td><td class="impor-san-excel-cell">${total}</td></tr>`;
    })
    .join('');
}

function init() {
  renderProductosExcelTabla();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
