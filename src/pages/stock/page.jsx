import { Fragment, useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import {
  obtenerProductos,
  obtenerReporteInventarioFba,
  obtenerComprometidos,
  obtenerReclamosMeli,
} from '../../js/api.js';
import { leerInventario } from '../../js/inventario-store.js';

// SKU de KIT → SKU base. El stock del kit se mueve al base ×2 y el kit queda en 0.
// Mantener sincronizado con backend/modules/stock_actual/mappings.py::KITS_A_BASE.
const KITS_A_BASE = {
  'C-DI-KIT-0025': 'C-DI-KGS-0025',
  'C-DI-KIT-0050': 'C-DI-KGS-0050',
};

function normalizarKits(mapa) {
  const out = { ...mapa };
  for (const [kit, base] of Object.entries(KITS_A_BASE)) {
    const qty = out[kit] ?? 0;
    if (qty) out[base] = (out[base] ?? 0) + qty * 2;
    out[kit] = 0;
  }
  return out;
}

// SKUs cuyo conteo en marklog viene por cajas de 10 unidades.
const MULTIPLICADOR_MARKLOG = {
  'C-BB-DIS-0001': 10,
  'C-BB-DIS-0002': 10,
  'C-BB-DIS-0003': 10,
};

function sumarMapas(...mapas) {
  const out = {};
  for (const m of mapas) {
    for (const [k, v] of Object.entries(m ?? {})) out[k] = (out[k] ?? 0) + v;
  }
  return out;
}

// Reasigna stock de SKUs desconocidos a su SKU real según `mapeo`.
function aplicarMapeo(mapa, mapeo) {
  const out = { ...mapa };
  for (const [desconocido, real] of Object.entries(mapeo)) {
    if (!real) continue;
    const qty = out[desconocido] ?? 0;
    if (!qty) continue;
    out[real] = (out[real] ?? 0) + qty;
    delete out[desconocido];
  }
  return out;
}

// SKUs que nunca deben aparecer como "no identificados".
function esIgnorado(sku) {
  if (!sku) return true;
  const lower = sku.toLowerCase();
  if (lower === 'nan') return true;
  if (lower.includes('parent')) return true;
  if (sku.includes('TC-DI-LB')) return true;
  return false;
}

const CLAVE_MAPEO = 'imporsan-mapeo-sku-v1';
function leerMapeo() {
  try { return JSON.parse(sessionStorage.getItem(CLAVE_MAPEO) ?? '{}'); }
  catch { return {}; }
}
function guardarMapeo(m) {
  try { sessionStorage.setItem(CLAVE_MAPEO, JSON.stringify(m)); } catch (_) {}
}

function construirFilas(catalogo, marklogPorSku, mapaAmazon, meli, ajusteMarklog = {}, ajusteMeli = {}) {
  return catalogo.map((producto) => {
    const meliBase  = meli[producto.sku] ?? 0;
    const meliQty   = Math.max(0, meliBase - (ajusteMeli[producto.sku] ?? 0));
    const amazon    = mapaAmazon[producto.sku] ?? 0;
    const marklogBase = (marklogPorSku[producto.sku] ?? 0)
                      * (MULTIPLICADOR_MARKLOG[producto.sku] ?? 1);
    const marklog   = Math.max(0, marklogBase - (ajusteMarklog[producto.sku] ?? 0));
    return {
      ...producto,
      mercadolibre: meliQty,
      amazon,
      marklog,
      total: meliQty + amazon + marklog,
    };
  });
}

function mapearAmazon(filas) {
  const mapa ={};
  for (const fila of filas) {
    const sku = fila.sku.trim();
    if(!sku) continue;
    mapa[sku] = parseInt(fila['afn-total-quantity'] || '0',10);
  }
  return mapa;
}

function descargarCsv(filas) {
  const encabezado = 'nombre,sku,mercadolibre,amazon,marklog,total';
  const cuerpo = filas.map((f) =>
    [f.nombre, f.sku, f.mercadolibre, f.amazon, f.marklog, f.total].join(','),
  );
  const csv   = [encabezado, ...cuerpo].join('\n');
  const blob  = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url   = URL.createObjectURL(blob);
  const a     = Object.assign(document.createElement('a'), {
    href: url,
    download: `imporsan-productos-${new Date().toISOString().slice(0, 10)}.csv`,
    rel: 'noopener',
    style: 'display:none',
  });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const PASOS = [
  ['Catálogo de productos', obtenerProductos],
  ['Inventario Amazon FBA', obtenerReporteInventarioFba],
];

export default function StockPage() {
  const [datos, setDatos]       = useState(null); // {catalogo, marklog, mapaAmazon, meli, listos}
  const [ajusteMarklog, setAjusteMarklog] = useState({}); // {sku: noListos}
  const [ajusteMeli, setAjusteMeli] = useState({}); // {sku: diferencia reclamos}
  const [mapeo, setMapeo] = useState(leerMapeo); // {skuDesconocido: skuReal}
  const [borradorMapeo, setBorradorMapeo] = useState({}); // {sku: textoInput}
  const [verificado, setVerificado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [progreso, setProgreso] = useState(0);
  const [error, setError]       = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargandoComp, setCargandoComp] = useState(false);
  const [comprometidos, setComprometidos] = useState([]);
  const [reclamos, setReclamos] = useState([]);
  const [errorModal, setErrorModal] = useState('');

  useEffect(() => {
    const tareas = PASOS.map(([, fn]) =>
      fn().then((r) => { setProgreso((p) => p + 1); return r; })
    );
    Promise.all(tareas)
      .then(([catalogo, filasAmazon]) => {
        const inv = leerInventario();
        const marklogStock = sumarMapas(
          normalizarKits(inv.almacen_mty ?? {}),
          normalizarKits(inv.almacen_tulti ?? {}),
        );
        const marklogListos = sumarMapas(
          normalizarKits(inv.almacen_mty_listos ?? {}),
          normalizarKits(inv.almacen_tulti_listos ?? {}),
        );
        setDatos({
          catalogo,
          mapaAmazon: normalizarKits(mapearAmazon(filasAmazon)),
          meli: normalizarKits(inv.mercadolibre ?? {}),
          marklog: marklogStock,
          listos: marklogListos,
        });
      })
      .catch((error) => {
        console.error(error);
        setError('No se pudo cargar el stock. Por favor, inténtelo de nuevo.');
      })
      .finally(() => setCargando(false));
  }, []);

  const filas = useMemo(() => {
    if (!datos) return [];
    return construirFilas(
      datos.catalogo,
      aplicarMapeo(datos.marklog, mapeo),
      aplicarMapeo(datos.mapaAmazon, mapeo),
      aplicarMapeo(datos.meli, mapeo),
      ajusteMarklog,
      ajusteMeli,
    );
  }, [datos, mapeo, ajusteMarklog, ajusteMeli]);

  const noIdentificados = useMemo(() => {
    if (!datos) return [];
    const skusCatalogo = new Set(datos.catalogo.map((p) => p.sku));
    const skus = new Set([
      ...Object.keys(datos.meli),
      ...Object.keys(datos.mapaAmazon),
      ...Object.keys(datos.marklog),
    ]);
    return [...skus]
      .filter((sku) => !skusCatalogo.has(sku) && !mapeo[sku] && !esIgnorado(sku))
      .map((sku) => ({
        sku,
        meli: datos.meli[sku] ?? 0,
        amazon: datos.mapaAmazon[sku] ?? 0,
        marklog: datos.marklog[sku] ?? 0,
      }))
      .filter((r) => r.meli + r.amazon + r.marklog > 0)
      .sort((a, b) => a.sku.localeCompare(b.sku));
  }, [datos, mapeo]);

  function aplicarMapeos() {
    const nuevos = { ...mapeo };
    for (const [sku, real] of Object.entries(borradorMapeo)) {
      const v = (real ?? '').trim();
      if (v) nuevos[sku] = v;
    }
    setMapeo(nuevos);
    guardarMapeo(nuevos);
    setBorradorMapeo({});
  }

  function abrirVerificar() {
    setModalAbierto(true);
    setErrorModal('');
    setCargandoComp(true);
    Promise.all([obtenerComprometidos(), obtenerReclamosMeli()])
      .then(([rowsComp, rowsRec]) => {
        // Agrupa por SKU sumando cantidad y guardando detalles por movimiento.
        const agrupado = {};
        for (const r of rowsComp) {
          const sku = r.productos.sku;
          if (!agrupado[sku]) {
            agrupado[sku] = {
              sku,
              nombre: r.productos.nombre,
              comprometido: 0,
              listos: datos?.listos?.[sku] ?? 0,
              detalles: [],
            };
          }
          const cant = Number(r.cantidad) || 0;
          agrupado[sku].comprometido += cant;
          agrupado[sku].detalles.push({
            id: r.id,
            cantidad: cant,
            nombreMov: r.mov.nombre,
            idInterno: r.mov.id_interno,
          });
        }
        const items = Object.values(agrupado)
          .filter((it) => it.comprometido !== it.listos)
          .map((it) => ({ ...it, noListos: String(Math.max(0, it.comprometido - it.listos)) }));
        setComprometidos(items);

        setReclamos(rowsRec.map((r) => ({
          id: r.id,
          sku: r.productos.sku,
          nombre: r.productos.nombre,
          enviada: Number(r.cantidad) || 0,
          ingresada: String(Number(r.cantidad) || 0),
          idInterno: r.mov.id_interno,
          nombreMov: r.mov.nombre,
        })));
      })
      .catch((e) => { console.error(e); setErrorModal('No se pudo cargar la verificación.'); })
      .finally(() => setCargandoComp(false));
  }

  function actualizarNoListos(sku, valor) {
    if (valor !== '' && !/^\d+$/.test(valor)) return;
    setComprometidos((prev) => prev.map((c) => c.sku === sku ? { ...c, noListos: valor } : c));
  }

  function actualizarIngresada(id, valor) {
    if (valor !== '' && !/^\d+$/.test(valor)) return;
    setReclamos((prev) => prev.map((r) => r.id === id ? { ...r, ingresada: valor } : r));
  }

  function guardarVerificacion() {
    const nuevoAjusteMarklog = {};
    for (const c of comprometidos) {
      const n = parseInt(c.noListos, 10);
      if (Number.isNaN(n) || !n) continue;
      nuevoAjusteMarklog[c.sku] = (nuevoAjusteMarklog[c.sku] ?? 0) + n;
    }
    const nuevoAjusteMeli = {};
    for (const r of reclamos) {
      const ing = parseInt(r.ingresada, 10);
      if (Number.isNaN(ing)) continue;
      const dif = r.enviada - ing;
      if (!dif) continue;
      nuevoAjusteMeli[r.sku] = (nuevoAjusteMeli[r.sku] ?? 0) + dif;
    }
    setAjusteMarklog(nuevoAjusteMarklog);
    setAjusteMeli(nuevoAjusteMeli);
    aplicarMapeos();
    setVerificado(true);
    setModalAbierto(false);
  }

  const total = PASOS.length;
  const pasoActual = PASOS[Math.min(progreso, total - 1)][0];
  const pct = Math.round((progreso / total) * 100);

  return (
    <div className="impor-san-layout">
      <Sidebar activo="stock" />

      <main className="impor-san-page impor-san-excel-page">
        <h1 className="impor-san-title">Stock</h1>
        <p className="impor-san-subtitle">Vista tipo hoja de cálculo</p>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        {!error && (
          <div className="impor-san-run-wrap" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="impor-san-run-button"
              onClick={abrirVerificar}
              disabled={cargando}
            >
              {verificado ? 'Verificar de nuevo' : 'Verificar'}
            </button>
            <button
              type="button"
              className="impor-san-run-button"
              onClick={() => descargarCsv(filas)}
              disabled={cargando || !verificado}
              title={!verificado ? 'Verifica los comprometidos antes de descargar' : ''}
            >
              Descargar CSV
            </button>
          </div>
        )}

        {modalAbierto && (
          <ModalVerificar
            cargando={cargandoComp}
            error={errorModal}
            comprometidos={comprometidos}
            reclamos={reclamos}
            noIdentificados={noIdentificados}
            borradorMapeo={borradorMapeo}
            onChangeMapeo={(sku, valor) => setBorradorMapeo((prev) => ({ ...prev, [sku]: valor }))}
            onChangeNoListos={actualizarNoListos}
            onChangeIngresada={actualizarIngresada}
            onGuardar={guardarVerificacion}
            onCerrar={() => setModalAbierto(false)}
          />
        )}

        <div className="impor-san-excel-wrap">
          <div className="impor-san-excel-scroll">
            <table className="impor-san-excel-grid" role="grid" aria-label="Tabla de productos">
              <thead>
                <tr>
                  <th className="impor-san-excel-corner" scope="col"></th>
                  <th className="impor-san-excel-col-header" scope="col">Nombre</th>
                  <th className="impor-san-excel-col-header" scope="col">SKU</th>
                  <th className="impor-san-excel-col-header" scope="col">Mercado Libre</th>
                  <th className="impor-san-excel-col-header" scope="col">Amazon</th>
                  <th className="impor-san-excel-col-header" scope="col">Marklog</th>
                  <th className="impor-san-excel-col-header" scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem' }}>
                      <div className="impor-san-progreso">
                        <div className="impor-san-progreso-texto">
                          <span>{progreso < total ? `Cargando: ${pasoActual}…` : 'Procesando…'}</span>
                          <span>{progreso}/{total} ({pct}%)</span>
                        </div>
                        <div className="impor-san-progreso-barra">
                          <div
                            className="impor-san-progreso-relleno"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filas.map((fila, i) => (
                    <tr key={fila.sku}>
                      <th className="impor-san-excel-row-header" scope="row">{i + 1}</th>
                      <td className="impor-san-excel-cell">{fila.nombre}</td>
                      <td className="impor-san-excel-cell">{fila.sku}</td>
                      <td className="impor-san-excel-cell">{fila.mercadolibre}</td>
                      <td className="impor-san-excel-cell">{fila.amazon}</td>
                      <td className="impor-san-excel-cell">{fila.marklog}</td>
                      <td className="impor-san-excel-cell">{fila.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function ModalVerificar({
  cargando, error, comprometidos, reclamos, noIdentificados,
  borradorMapeo, onChangeMapeo,
  onChangeNoListos, onChangeIngresada, onGuardar, onCerrar,
}) {
  const [expandido, setExpandido] = useState(() => new Set());
  const toggle = (sku) =>
    setExpandido((prev) => {
      const next = new Set(prev);
      next.has(sku) ? next.delete(sku) : next.add(sku);
      return next;
    });

  return (
    <div
      className="impor-san-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onCerrar}
    >
      <div className="impor-san-modal" onClick={(e) => e.stopPropagation()}>
        <div className="impor-san-modal-header">
          <h2 className="impor-san-modal-title">Verificar comprometidos vs listos</h2>
        </div>

        <div className="impor-san-modal-body">
          <ul className="impor-san-alert">
            <li>Recuerda revisar que el stock de las barras en marklog sea el correcto</li>
            <li>Recuerda revisar que todos las plataformas tengan stock</li>
          </ul>

          {error && <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>}

          {cargando ? (
            <p>Cargando verificación…</p>
          ) : (
            <>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1rem' }}>Comprometidos vs listos</h3>
              {comprometidos.length === 0 ? (
                <p>No hay diferencias entre comprometidos y listos.</p>
              ) : (
                <table className="impor-san-modal-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Producto</th>
                      <th>Comprometidos</th>
                      <th>Listos</th>
                      <th>Movimientos</th>
                      <th>No listos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprometidos.map((c) => {
                      const abierto = expandido.has(c.sku);
                      const multiple = c.detalles.length > 1;
                      return (
                        <Fragment key={c.sku}>
                          <tr>
                            <td style={{ width: '1.5rem' }}>
                              {multiple && (
                                <button
                                  type="button"
                                  className="impor-san-toggle"
                                  onClick={() => toggle(c.sku)}
                                  aria-label={abierto ? 'Colapsar' : 'Expandir'}
                                >
                                  {abierto ? '▾' : '▸'}
                                </button>
                              )}
                            </td>
                            <td>{c.nombre}</td>
                            <td>{c.comprometido}</td>
                            <td>{c.listos}</td>
                            <td>{multiple ? `${c.detalles.length} movimientos` : c.detalles[0].nombreMov}</td>
                            <td>
                              <input
                                type="text"
                                inputMode="numeric"
                                className="impor-san-input impor-san-input-num"
                                value={c.noListos}
                                onChange={(ev) => onChangeNoListos(c.sku, ev.target.value)}
                              />
                            </td>
                          </tr>
                          {abierto && c.detalles.map((d) => (
                            <tr key={d.id} className="impor-san-modal-table-sub">
                              <td></td>
                              <td style={{ paddingLeft: '1.5rem', color: 'var(--color-muted)' }}>↳ {d.idInterno}</td>
                              <td>{d.cantidad}</td>
                              <td></td>
                              <td colSpan={2} style={{ color: 'var(--color-muted)' }}>{d.nombreMov}</td>
                            </tr>
                          ))}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}

              <h3 style={{ margin: '1rem 0 0.5rem', fontSize: '1rem' }}>Envíos con reclamo (Mercado Libre)</h3>
              {reclamos.length === 0 ? (
                <p>No hay envíos en reclamo.</p>
              ) : (
                <table className="impor-san-modal-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Enviada</th>
                      <th>Ingresada</th>
                      <th>ID interno</th>
                      <th>Movimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reclamos.map((r) => (
                      <tr key={r.id}>
                        <td>{r.nombre}</td>
                        <td>{r.enviada}</td>
                        <td>
                          <input
                            type="text"
                            inputMode="numeric"
                            className="impor-san-input impor-san-input-num"
                            value={r.ingresada}
                            onChange={(ev) => onChangeIngresada(r.id, ev.target.value)}
                          />
                        </td>
                        <td>{r.idInterno}</td>
                        <td>{r.nombreMov}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h3 style={{ margin: '1rem 0 0.5rem', fontSize: '1rem' }}>
                Productos no identificados
                {noIdentificados.length > 0 && (
                  <span className="impor-san-no-id-count">{noIdentificados.length}</span>
                )}
              </h3>
              {noIdentificados.length === 0 ? (
                <p>Todos los SKUs de los dropins están en el catálogo.</p>
              ) : (
                <table className="impor-san-modal-table">
                  <thead>
                    <tr>
                      <th>SKU desconocido</th>
                      <th>ML</th>
                      <th>Amazon</th>
                      <th>Marklog</th>
                      <th>SKU real</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noIdentificados.map((r) => (
                      <tr key={r.sku}>
                        <td><code>{r.sku}</code></td>
                        <td>{r.meli}</td>
                        <td>{r.amazon}</td>
                        <td>{r.marklog}</td>
                        <td>
                          <input
                            type="text"
                            className="impor-san-input"
                            placeholder="Ej. C-DI-KGS-0025"
                            value={borradorMapeo[r.sku] ?? ''}
                            onChange={(ev) => onChangeMapeo(r.sku, ev.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        <div className="impor-san-modal-footer">
          <button type="button" className="impor-san-btn impor-san-btn-ghost" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="impor-san-btn impor-san-btn-primary"
            onClick={onGuardar}
            disabled={cargando || !!error}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
