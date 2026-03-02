import './style.css'
import getProducts from './js/pulldata.js'
import handleMeli from './js/meli-csv-handler.js'
import handleAmz from './js/amz-csv-handler.js'

document.getElementById('impor-san-run-button').addEventListener('click', getProducts);

document.addEventListener('imporSanCsvDropped', function (e) {
  if (e.detail.source === 'mercadolibre') {
    handleMeli(e.detail.file);
  }
  if (e.detail.source === 'amazon') { 
    handleAmz(e.detail.file);
  }
});

console.log('main.js loaded');

