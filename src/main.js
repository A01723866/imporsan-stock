import './style.css'
import { updateTotal } from './js/productos-excel-data.js'
import handleMeli from './js/meli-csv-handler.js'
import handleAmz from './js/amz-csv-handler.js'
import handleSpakio from './js/spakio-csv-handler.js'

document.getElementById('update-total-button').addEventListener('click', updateTotal);

document.addEventListener('imporSanCsvDropped', function (e) {
  if (e.detail.source === 'mercadolibre') {
    handleMeli(e.detail.file);
  }
  if (e.detail.source === 'amazon') { 
    handleAmz(e.detail.file);
  }
  if (e.detail.source === 'spakio') {
    handleSpakio(e.detail.file);
  }
});
sessionStorage.clear();
console.log('sessionStorage cleared');
console.log('main.js loaded');

