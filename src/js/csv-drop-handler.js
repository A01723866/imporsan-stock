/**
 * ImporSan - Manejador de drag & drop para archivos CSV y Excel (.xlsx).
 * Cada zona guarda su File en el dataset del nodo para uso posterior del script de procesamiento.
 */

(function () {
  const CSV_MIME_TYPES = ["text/csv", "application/csv", "text/plain"];
  const CSV_EXTENSION = ".csv";
  const XLSX_EXTENSION = ".xlsx";
  const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  function isFileCsvOrXlsx(file) {
    const name = (file.name || "").toLowerCase();
    const type = file.type || "";
    return (
      name.endsWith(CSV_EXTENSION) ||
      name.endsWith(XLSX_EXTENSION) ||
      CSV_MIME_TYPES.includes(type) ||
      type === XLSX_MIME
    );
  }

  function getZoneFileDisplayEl(zone) {
    return zone.querySelector("[data-file-display]");
  }

  function setZoneFile(zone, file) {
    if (!file) {
      zone.classList.remove("impor-san-drop-zone-has-file");
      zone.dataset.imporSanCsvFile = "";
      const display = getZoneFileDisplayEl(zone);
      if (display) display.textContent = "";
      return;
    }
    zone.classList.add("impor-san-drop-zone-has-file");
    zone.dataset.imporSanCsvFile = file.name;
    const display = getZoneFileDisplayEl(zone);
    if (display) display.textContent = "✓ " + file.name;
  }

  function handleFileInZone(zone, file) {
    if (!isFileCsvOrXlsx(file)) {
      alert("Por favor usa un archivo CSV (.csv) o Excel (.xlsx).");
      return;
    }
    zone._imporSanCsvFileObject = file;
    setZoneFile(zone, file);
    const source = zone.getAttribute("data-source");
    if (source) {
      document.dispatchEvent(new CustomEvent("imporSanCsvDropped", { detail: { source, file } }));
    }
  }

  function setupDropZone(zone) {
    const input = zone.querySelector(".impor-san-drop-zone-input");
    if (!input) return;

    zone.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add("impor-san-drop-zone-dragover");
    });

    zone.addEventListener("dragleave", function (e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove("impor-san-drop-zone-dragover");
    });

    zone.addEventListener("drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove("impor-san-drop-zone-dragover");
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFileInZone(zone, file);
    });

    input.addEventListener("change", function () {
      const file = input.files?.[0];
      if (file) handleFileInZone(zone, file);
      input.value = "";
    });
  }

  function setupRunButton() {
    const btn = document.getElementById("impor-san-run-button");
    if (!btn) return;
    btn.addEventListener("click", function () {
      document.dispatchEvent(new CustomEvent("imporSanRun"));
    });
  }

  function init() {
    const zones = document.querySelectorAll(".impor-san-drop-zone");
    zones.forEach(setupDropZone);
    setupRunButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // API para el script de procesamiento: obtener el File de una fuente
  window.ImporSanGetCsvFile = function (source) {
    const zone = document.querySelector('.impor-san-drop-zone[data-source="' + source + '"]');
    return zone ? zone._imporSanCsvFileObject || null : null;
  };
})();
