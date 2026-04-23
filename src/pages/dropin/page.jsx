import { useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import { subirArchivo } from '../../js/api.js';
import { guardarInventario, limpiarInventario } from '../../js/inventario-store.js';

const TIPOS_VALIDOS = [
  'text/csv',
  'application/csv',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

function esArchivoValido(file) {
  const nombre = (file?.name ?? '').toLowerCase();
  return (
    nombre.endsWith('.csv') ||
    nombre.endsWith('.xlsx') ||
    TIPOS_VALIDOS.includes(file?.type ?? '')
  );
}

const PLATAFORMAS = [
  { id: 'mercadolibre', label: 'Mercado Libre' },
  { id: 'amazon',       label: 'Amazon' },
  { id: 'spakio',       label: 'Spakio' },
];

/** @typedef {'idle' | 'cargando' | 'ok' | 'error'} EstadoZona */

export default function DropInPage() {
  const estadoInicial = useMemo(
    () => Object.fromEntries(PLATAFORMAS.map((p) => [p.id, { estado: 'idle', archivo: '' }])),
    [],
  );

  const [zonas, setZonas] = useState(estadoInicial);
  const [dragOver, setDragOver] = useState({});

  function actualizarZona(id, cambios) {
    setZonas((prev) => ({ ...prev, [id]: { ...prev[id], ...cambios } }));
  }

  async function procesarArchivo(plataformaId, file) {
    if (!file) return;
    if (!esArchivoValido(file)) {
      alert('Solo se aceptan archivos CSV (.csv) o Excel (.xlsx).');
      return;
    }

    actualizarZona(plataformaId, { estado: 'cargando', archivo: file.name });

    try {
      const resultado = await subirArchivo(plataformaId, file);
      guardarInventario(plataformaId, resultado.inventario);
      actualizarZona(plataformaId, { estado: 'ok' });
    } catch (error) {
      console.error(`Error procesando ${plataformaId}:`, error);
      actualizarZona(plataformaId, { estado: 'error' });
      alert(`No se pudo procesar el archivo de ${plataformaId}:\n${error.message}`);
    }
  }

  function manejarNuevaSesion() {
    limpiarInventario();
    setZonas(estadoInicial);
  }

  return (
    <div className="impor-san-layout">
      <Sidebar activo="dropin" />

      <main className="impor-san-page">
        <h1 className="impor-san-title">DropIn</h1>
        <p className="impor-san-subtitle">
          Arrastra o suelta tu archivo en la sección correspondiente
        </p>

        <section className="impor-san-drop-zones">
          {PLATAFORMAS.map(({ id, label }) => {
            const zona = zonas[id];
            const clases = [
              'impor-san-drop-zone',
              `impor-san-drop-zone-${id}`,
              dragOver[id]         ? 'impor-san-drop-zone-dragover'  : '',
              zona.estado === 'ok' ? 'impor-san-drop-zone-has-file'  : '',
            ].filter(Boolean).join(' ');

            return (
              <section
                key={id}
                className={clases}
                onDragOver={(e) => { e.preventDefault(); setDragOver((p) => ({ ...p, [id]: true })); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver((p) => ({ ...p, [id]: false })); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver((p) => ({ ...p, [id]: false }));
                  void procesarArchivo(id, e.dataTransfer?.files?.[0]);
                }}
              >
                <input
                  type="file"
                  className="impor-san-drop-zone-input"
                  accept=".csv,.xlsx"
                  aria-label={`Seleccionar archivo de ${label}`}
                  onChange={(e) => {
                    void procesarArchivo(id, e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <div className="impor-san-drop-zone-inner">
                  <span className="impor-san-drop-zone-icon" aria-hidden="true">📦</span>
                  <h2 className="impor-san-drop-zone-title">{label}</h2>
                  <p className="impor-san-drop-zone-hint">Suelta aquí tu CSV o Excel de {label}</p>
                  <p className="impor-san-drop-zone-file-name">
                    {zona.estado === 'cargando' && '⏳ Procesando...'}
                    {zona.estado === 'ok'       && `✓ ${zona.archivo}`}
                    {zona.estado === 'error'    && '✗ Error al procesar'}
                  </p>
                </div>
              </section>
            );
          })}
        </section>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="impor-san-run-button"
            onClick={manejarNuevaSesion}
            style={{ background: 'transparent', color: '#666', fontSize: '0.85rem' }}
          >
            Limpiar y empezar de nuevo
          </button>
        </div>
      </main>
    </div>
  );
}
