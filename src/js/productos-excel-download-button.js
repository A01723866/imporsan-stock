import { downloadProductosExcelCsv } from './productos-excel-data.js';

const IMPOR_SAN_PRODUCTOS_EXCEL_DOWNLOAD_BUTTON_ID =
  'impor-san-productos-excel-download-button';

function initProductosExcelDownloadButton() {
  const button = document.getElementById(IMPOR_SAN_PRODUCTOS_EXCEL_DOWNLOAD_BUTTON_ID);
  if (!button) return;

  button.addEventListener('click', () => {
    downloadProductosExcelCsv();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductosExcelDownloadButton);
} else {
  initProductosExcelDownloadButton();
}

