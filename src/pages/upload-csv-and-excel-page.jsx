import { useEffect, useMemo, useState } from 'react';
import { updateTotal } from '../js/productos-excel-data.js';
import handleMeli from '../js/meli-csv-handler.js';
import handleAmz from '../js/amz-csv-handler.js';
import handleSpakio from '../js/spakio-csv-handler.js';

const CSV_MIME_TYPES = ['text/csv', 'application/csv', 'text/plain'];
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function isFileCsvOrXlsx(file) {
  const name = (file?.name || '').toLowerCase();
  const type = file?.type || '';
  return (
    name.endsWith('.csv') ||
    name.endsWith('.xlsx') ||
    CSV_MIME_TYPES.includes(type) ||
    type === XLSX_MIME
  );
}

export default function UploadCsvAndExcelPage() {
  const [zoneFileNamesBySource, setZoneFileNamesBySource] = useState({
    mercadolibre: '',
    amazon: '',
    spakio: '',
  });
  const [zoneIsDragOverBySource, setZoneIsDragOverBySource] = useState({
    mercadolibre: false,
    amazon: false,
    spakio: false,
  });

  const handlersBySource = useMemo(
    () => ({
      mercadolibre: handleMeli,
      amazon: handleAmz,
      spakio: handleSpakio,
    }),
    [],
  );

  useEffect(() => {
    sessionStorage.clear();
    console.log('sessionStorage cleared');
    console.log('React upload page loaded');
  }, []);

  async function handleFileForSource(source, file) {
    if (!file) return;
    if (!isFileCsvOrXlsx(file)) {
      alert('Por favor usa un archivo CSV (.csv) o Excel (.xlsx).');
      return;
    }

    setZoneFileNamesBySource((prevState) => ({
      ...prevState,
      [source]: file.name,
    }));

    const sourceHandler = handlersBySource[source];
    if (!sourceHandler) return;

    try {
      await sourceHandler(file);
    } catch (error) {
      console.error(`Error procesando archivo de ${source}:`, error);
      alert(`No se pudo procesar el archivo de ${source}.`);
    }
  }

  function setDragOverState(source, isDragOver) {
    setZoneIsDragOverBySource((prevState) => ({
      ...prevState,
      [source]: isDragOver,
    }));
  }

  const sources = [
    { id: 'mercadolibre', label: 'Mercado Libre' },
    { id: 'amazon', label: 'Amazon' },
    { id: 'spakio', label: 'Spakio' },
  ];

  return (
    <>
      <nav className="impor-san-nav" aria-label="Navegacion principal">
        <a href="index.html" className="impor-san-nav-link impor-san-nav-link-current">
          Carga de archivos
        </a>
        <a
          href="/src/productos-excel.html"
          className="impor-san-nav-link"
          onClick={() => updateTotal()}
        >
          Productos
        </a>
      </nav>

      <main className="impor-san-page">
        <h1 className="impor-san-title">Carga de archivos CSV o Excel</h1>
        <p className="impor-san-subtitle">
          Arrastra o suelta tu archivo CSV o XLSX en la seccion correspondiente
        </p>

        <section className="impor-san-drop-zones">
          {sources.map((sourceItem) => {
            const sourceId = sourceItem.id;
            const isDragOver = zoneIsDragOverBySource[sourceId];
            const fileName = zoneFileNamesBySource[sourceId];
            const hasFile = Boolean(fileName);
            const zoneClassName = [
              'impor-san-drop-zone',
              `impor-san-drop-zone-${sourceId}`,
              isDragOver ? 'impor-san-drop-zone-dragover' : '',
              hasFile ? 'impor-san-drop-zone-has-file' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <section
                key={sourceId}
                className={zoneClassName}
                data-source={sourceId}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverState(sourceId, true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragOverState(sourceId, false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOverState(sourceId, false);
                  const droppedFile = event.dataTransfer?.files?.[0];
                  void handleFileForSource(sourceId, droppedFile);
                }}
              >
                <input
                  type="file"
                  className="impor-san-drop-zone-input"
                  accept=".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  aria-label={`Seleccionar CSV o Excel ${sourceItem.label}`}
                  onChange={(event) => {
                    const inputFile = event.target.files?.[0];
                    void handleFileForSource(sourceId, inputFile);
                    event.target.value = '';
                  }}
                />
                <div className="impor-san-drop-zone-inner">
                  <span className="impor-san-drop-zone-icon" aria-hidden="true">
                    📦
                  </span>
                  <h2 className="impor-san-drop-zone-title">{sourceItem.label}</h2>
                  <p className="impor-san-drop-zone-hint">
                    Suelta aqui tu CSV o Excel de {sourceItem.label}
                  </p>
                  <p className="impor-san-drop-zone-file-name" data-file-display>
                    {fileName ? `✓ ${fileName}` : ''}
                  </p>
                </div>
              </section>
            );
          })}
        </section>
      </main>
    </>
  );
}
