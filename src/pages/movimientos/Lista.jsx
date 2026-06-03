/**
 * Lista de movimientos con filtros, alta y baja.
 *
 * Filtros (client-side, sobre el array que devuelve el backend):
 *   - rango de fechas sobre fecha_creacion
 *   - estado (dropdown)
 *   - canal (Todos / B2C / B2B)
 *
 * Para volúmenes bajos esto es perfecto. Si en algún momento hay miles
 * de movimientos, mover el filtrado al backend.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  actualizarMovimiento,
  crearMovCosto,
  crearMovimiento,
  crearMovProd,
  eliminarMovimiento,
  obtenerCostoTipos,
  obtenerEstados,
  obtenerMovimientos,
  obtenerProductos,
} from '../../js/api.js';

const CANALES = ['B2C', 'B2B'];
const PLATAFORMAS = ['Mercado Libre', 'Amazon', 'Shopify', 'TikTok'];

const COLORES_ESTADO = {
  'f21aa5a4-33d0-419e-aa2a-e10a6369351a': { background: '#fde68a', color: '#92400e' }, // comprometido
  '81422795-bce8-4a48-bc3c-41d71ba1c802': { background: '#bbf7d0', color: '#14532d' }, // envío completo
  '89af0089-6d3b-4a5b-aeb4-39edcdef4b3e': { background: '#fef08a', color: '#713f12' }, // en proceso
  'b23ee1d2-ca56-4533-af1f-eafd54abdc95': { background: '#bfdbfe', color: '#1e3a5f' }, // azul
  'd2173d71-9311-40c4-9d8c-36a97233c594': { background: '#fed7aa', color: '#7c2d12' }, // reclamo
};

export default function Lista({ onAbrirDetalle }) {
  const [movimientos, setMovimientos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCanal, setFiltroCanal] = useState('');
  const [filtroPlataforma, setFiltroPlataforma] = useState('');

  // Ordenamiento
  const [sortCampo, setSortCampo] = useState('fecha_creacion');
  const [sortDir, setSortDir] = useState('desc');

  const toggleSort = (campo) => {
    if (sortCampo === campo) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCampo(campo);
      setSortDir('desc');
    }
  };

  // Form de alta
  const [mostrarForm, setMostrarForm] = useState(false);

  const recargar = () => {
    setCargando(true);
    Promise.all([obtenerMovimientos(), obtenerEstados()])
      .then(([movs, ests]) => {
        setMovimientos(movs);
        setEstados(ests);
        setError('');
      })
      .catch((e) => setError(e.message ?? 'Error al cargar movimientos.'))
      .finally(() => setCargando(false));
  };

  useEffect(recargar, []);


  const filas = useMemo(() => {
    const filtradas = movimientos.filter((m) => {
      if (filtroEstado && m.estado !== filtroEstado) return false;
      if (filtroCanal && m.canal !== filtroCanal) return false;
      if (filtroPlataforma && m.plataforma !== filtroPlataforma) return false;
      if (fechaDesde && m.fecha_creacion < fechaDesde) return false;
      if (fechaHasta && m.fecha_creacion > `${fechaHasta}T23:59:59`) return false;
      return true;
    });
    return filtradas.sort((a, b) => {
      const va = a[sortCampo] ?? '';
      const vb = b[sortCampo] ?? '';
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [movimientos, filtroEstado, filtroCanal, filtroPlataforma, fechaDesde, fechaHasta, sortCampo, sortDir]);

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este movimiento? No se puede deshacer.')) return;
    try {
      await eliminarMovimiento(id);
      recargar();
    } catch (e) {
      alert(`No se pudo eliminar: ${e.message}`);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await actualizarMovimiento(id, { estado: nuevoEstado });
      setMovimientos((prev) =>
        prev.map((m) => (m.id === id ? { ...m, estado: nuevoEstado } : m)),
      );
    } catch (e) {
      alert(`No se pudo cambiar el estado: ${e.message}`);
    }
  };

  const handleCrear = (nuevo) => {
    setMostrarForm(false);
    onAbrirDetalle(nuevo.id);
  };

  return (
    <>
      <div className="impor-san-page-header">
        <h1 className="impor-san-title">Órdenes & Envíos</h1>
        <p className="impor-san-subtitle">Gestión de movimientos de inventario</p>
      </div>

      {error && <p className="impor-san-error">{error}</p>}

      <section className="impor-san-card">
        <header className="impor-san-card-header">
          <h2 className="impor-san-card-title">Filtros</h2>
          <button
            type="button"
            className="impor-san-btn impor-san-btn-primary"
            onClick={() => setMostrarForm((v) => !v)}
          >
            {mostrarForm ? 'Cancelar' : '+ Nuevo movimiento'}
          </button>
        </header>

        <div className="impor-san-filtros">
          <label>
            Desde
            <input
              type="date"
              className="impor-san-input"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              className="impor-san-input"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </label>
          <label>
            Estado
            <select
              className="impor-san-input"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              {estados.map((es) => (
                <option key={es.id} value={es.id}>{es.texto}</option>
              ))}
            </select>
          </label>
          <label>
            Canal
            <select
              className="impor-san-input"
              value={filtroCanal}
              onChange={(e) => setFiltroCanal(e.target.value)}
            >
              <option value="">Todos</option>
              {CANALES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Plataforma
            <select
              className="impor-san-input"
              value={filtroPlataforma}
              onChange={(e) => setFiltroPlataforma(e.target.value)}
            >
              <option value="">Todas</option>
              {PLATAFORMAS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
        </div>
      </section>

      {mostrarForm && (
        <FormCrear
          estados={estados}
          onCrear={handleCrear}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      <section className="impor-san-card">
        <table className="impor-san-table">
          <thead>
            <tr>
              <th>ID interno</th>
              <th>Nombre</th>
              <th>Plataforma</th>
              <th>Estado</th>
              <th style={{ minWidth: '220px' }}>Notas</th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                onClick={() => toggleSort('fecha_creacion')}
              >
                Creado {sortCampo === 'fecha_creacion' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                onClick={() => toggleSort('fecha_modificacion')}
              >
                Modificado {sortCampo === 'fecha_modificacion' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={8} className="impor-san-empty-row">Cargando…</td></tr>
            ) : filas.length === 0 ? (
              <tr><td colSpan={8} className="impor-san-empty-row">Sin movimientos.</td></tr>
            ) : (
              filas.map((m) => (
                <tr key={m.id} className="impor-san-row-clickable">
                  <td>
                    <a
                      href="#"
                      className="impor-san-link"
                      onClick={(e) => { e.preventDefault(); onAbrirDetalle(m.id); }}
                    >
                      {m.id_interno}
                    </a>
                  </td>
                  <td>{m.nombre}</td>
                  <td className="impor-san-table-muted">{m.plataforma ?? '—'}</td>
                  <td>
                    <select
                      className="impor-san-input"
                      value={m.estado}
                      style={{ ...COLORES_ESTADO[m.estado], fontSize: '0.82rem', padding: '0.4rem', borderRadius: '999px', border: 'none', cursor: 'pointer', width: 'fit-content' }}
                      onChange={(e) => { e.stopPropagation(); void handleCambiarEstado(m.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {estados.map((es) => (
                        <option key={es.id} value={es.id}>{es.texto}</option>
                      ))}
                    </select>
                  </td>
                  <td className="impor-san-table-muted" style={{ minWidth: '220px' }}>{m.notas ?? '—'}</td>
                  <td className="impor-san-table-muted">{formatearFecha(m.fecha_creacion)}</td>
                  <td className="impor-san-table-muted">{formatearFecha(m.fecha_modificacion)}</td>
                  <td>
                    <button
                      type="button"
                      className="impor-san-btn impor-san-btn-danger"
                      onClick={() => handleEliminar(m.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

const PLATAFORMAS_B2B = ['Mercado Libre', 'Amazon'];
const PLATAFORMAS_B2C = ['Shopify', 'TikTok', 'Mercado Libre'];
const ESTADOS_PROD_DISPONIBLES = new Set(['Activo', 'En Liquidación', 'Labs']);

function FormCrear({ estados, onCrear, onCancelar }) {
  // Datos del movimiento
  const [nombre, setNombre] = useState('');
  const [idInterno, setIdInterno] = useState('');
  const [estado, setEstado] = useState('');
  const [canal, setCanal] = useState('B2C');
  const [plataforma, setPlataforma] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [notas, setNotas] = useState('');

  // Catálogos
  const [productos, setProductos] = useState([]);
  const [costoTipos, setCostoTipos] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

  // Items seleccionados (solo en memoria, no en DB aún)
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [costosSeleccionados, setCostosSeleccionados] = useState([]);

  // UI del catálogo de productos
  const [busqueda, setBusqueda] = useState('');
  const [cantidadesCatalogo, setCantidadesCatalogo] = useState({});

  // UI del formulario de costos
  const [tipoSel, setTipoSel] = useState('');
  const [cantidadCosto, setCantidadCosto] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [productosAbierto, setProductosAbierto] = useState(true);

  useEffect(() => {
    Promise.all([obtenerProductos(), obtenerCostoTipos()])
      .then(([prods, tipos]) => { setProductos(prods); setCostoTipos(tipos); })
      .finally(() => setCargandoCatalogos(false));
  }, []);

  const handleCanalChange = (e) => { setCanal(e.target.value); setPlataforma(''); };

  // Productos
  const idsSeleccionados = useMemo(
    () => new Set(productosSeleccionados.map((p) => p.id_producto)),
    [productosSeleccionados],
  );

  const catalogoFiltrado = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      if (!ESTADOS_PROD_DISPONIBLES.has(p.estado)) return false;
      if (idsSeleccionados.has(p.id)) return false;
      if (texto) {
        const haystack = `${p.nombre ?? ''} ${p.sku ?? ''}`.toLowerCase();
        if (!haystack.includes(texto)) return false;
      }
      return true;
    });
  }, [productos, idsSeleccionados, busqueda]);

  const agregarProducto = (producto) => {
    const cantidad = Number(cantidadesCatalogo[producto.id]);
    if (!cantidad || cantidad <= 0) { alert('Indicá una cantidad mayor a 0.'); return; }
    setProductosSeleccionados((prev) => [
      ...prev,
      { id_producto: producto.id, nombre: producto.nombre, sku: producto.sku, cantidad },
    ]);
    setCantidadesCatalogo((prev) => { const s = { ...prev }; delete s[producto.id]; return s; });
  };

  const quitarProducto = (id_producto) =>
    setProductosSeleccionados((prev) => prev.filter((p) => p.id_producto !== id_producto));

  // Costos
  const agregarCosto = () => {
    if (!tipoSel || !cantidadCosto) return;
    const tipo = costoTipos.find((t) => t.id === tipoSel);
    setCostosSeleccionados((prev) => [
      ...prev,
      { id_costo: tipoSel, tipo: tipo?.tipo ?? tipoSel, cantidad: Number(cantidadCosto) },
    ]);
    setTipoSel('');
    setCantidadCosto('');
  };

  const quitarCosto = (idx) =>
    setCostosSeleccionados((prev) => prev.filter((_, i) => i !== idx));

  // Submit: crear movimiento → insertar productos → insertar costos (rollback si falla)
  const submit = async (e) => {
    e.preventDefault();
    if (!nombre || !idInterno || !estado) {
      alert('Nombre, ID interno y Estado son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      const nuevo = await crearMovimiento({
        nombre, id_interno: idInterno, estado, canal,
        plataforma: plataforma || null,
        descripcion: descripcion || null,
        notas: notas || null,
      });
      try {
        for (const p of productosSeleccionados) {
          await crearMovProd({ id_movimiento: nuevo.id, id_producto: p.id_producto, cantidad: p.cantidad });
        }
        for (const c of costosSeleccionados) {
          await crearMovCosto({ id_movimiento: nuevo.id, id_costo: c.id_costo, cantidad: c.cantidad });
        }
        onCrear(nuevo);
      } catch (err) {
        await eliminarMovimiento(nuevo.id);
        throw err;
      }
    } catch (err) {
      alert(`No se pudo crear: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="impor-san-card">
      <form onSubmit={submit} className="impor-san-form">
        <header className="impor-san-card-header">
          <h2 className="impor-san-card-title">Nuevo movimiento</h2>
          <div className="impor-san-card-actions">
            <button
              type="submit"
              className="impor-san-btn impor-san-btn-primary"
              disabled={guardando}
            >
              {guardando ? 'Creando…' : 'Crear movimiento'}
            </button>
            <button
              type="button"
              className="impor-san-btn impor-san-btn-ghost"
              onClick={onCancelar}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        </header>
        {/* ── Datos del movimiento ── */}
        <div className="impor-san-form-grid">
          <label>Nombre<input className="impor-san-input" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></label>
          <label>ID interno<input className="impor-san-input" value={idInterno} onChange={(e) => setIdInterno(e.target.value)} required /></label>
          <label>Estado
            <select className="impor-san-input" value={estado} onChange={(e) => setEstado(e.target.value)} required>
              <option value="">Seleccionar…</option>
              {estados.map((es) => <option key={es.id} value={es.id}>{es.texto}</option>)}
            </select>
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <label style={{ flex: 1 }}>Canal
              <select className="impor-san-input" value={canal} onChange={handleCanalChange}>
                {CANALES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label style={{ flex: 1 }}>Plataforma
              <select className="impor-san-input" value={plataforma} onChange={(e) => setPlataforma(e.target.value)}>
                <option value="">— opcional —</option>
                {(canal === 'B2B' ? PLATAFORMAS_B2B : PLATAFORMAS_B2C).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="impor-san-form-full">Descripción
            <textarea className="impor-san-input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </label>
          <label className="impor-san-form-full">Notas
            <textarea className="impor-san-input" value={notas} onChange={(e) => setNotas(e.target.value)} />
          </label>
        </div>

        {/* ── Productos ── */}
        <section className="impor-san-card" style={{ marginTop: '1.5rem' }}>
          <header className="impor-san-card-header">
            <h3 className="impor-san-card-title">
              Productos
              {productosSeleccionados.length > 0 && (
                <span className="impor-san-id-badge" style={{ marginLeft: '0.5rem' }}>
                  {productosSeleccionados.length}
                </span>
              )}
            </h3>
            <button
              type="button"
              className="impor-san-btn impor-san-btn-ghost"
              onClick={() => setProductosAbierto((v) => !v)}
              style={{ fontSize: '0.85rem' }}
            >
              {productosAbierto ? 'Colapsar ↑' : 'Expandir ↓'}
            </button>
          </header>

          {productosAbierto && productosSeleccionados.length > 0 && (
            <table className="impor-san-table" style={{ marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th className="impor-san-table-num">Cantidad</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {productosSeleccionados.map((p) => (
                  <tr key={p.id_producto}>
                    <td>{p.nombre}</td>
                    <td className="impor-san-table-mono">{p.sku}</td>
                    <td className="impor-san-table-num">{p.cantidad}</td>
                    <td>
                      <button type="button" className="impor-san-btn impor-san-btn-danger" onClick={() => quitarProducto(p.id_producto)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {productosAbierto && (
          <section className="impor-san-card" style={{ marginTop: '0.5rem' }}>
            <header className="impor-san-card-header">
              <h4 className="impor-san-card-title" style={{ fontSize: '0.9rem' }}>Catálogo</h4>
              <input
                type="search"
                placeholder="Buscar por nombre o SKU…"
                className="impor-san-input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </header>
            {cargandoCatalogos ? (
              <p className="impor-san-empty">Cargando catálogo…</p>
            ) : (
              <table className="impor-san-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th className="impor-san-table-num" style={{ width: '120px' }}>Cantidad</th>
                    <th style={{ width: '120px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {catalogoFiltrado.length === 0 ? (
                    <tr><td colSpan={4} className="impor-san-empty-row">Sin productos disponibles.</td></tr>
                  ) : (
                    catalogoFiltrado.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nombre}</td>
                        <td className="impor-san-table-mono">{p.sku}</td>
                        <td className="impor-san-table-num">
                          <input
                            type="number" min="1"
                            className="impor-san-input impor-san-input-num"
                            value={cantidadesCatalogo[p.id] ?? ''}
                            onChange={(e) => setCantidadesCatalogo((prev) => ({ ...prev, [p.id]: e.target.value }))}
                          />
                        </td>
                        <td>
                          <button type="button" className="impor-san-btn impor-san-btn-primary" onClick={() => agregarProducto(p)}>
                            Agregar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </section>
          )}
        </section>

        {/* ── Costos ── */}
        <section className="impor-san-card" style={{ marginTop: '1rem' }}>
          <header className="impor-san-card-header">
            <h3 className="impor-san-card-title">Costos</h3>
          </header>

          {costosSeleccionados.length > 0 && (
            <table className="impor-san-table" style={{ marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th>Tipo de costo</th>
                  <th className="impor-san-table-num">Cantidad</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {costosSeleccionados.map((c, i) => (
                  <tr key={i}>
                    <td>{c.tipo}</td>
                    <td className="impor-san-table-num">{c.cantidad}</td>
                    <td>
                      <button type="button" className="impor-san-btn impor-san-btn-danger" onClick={() => quitarCosto(i)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="impor-san-inline-form">
            <select
              className="impor-san-input"
              value={tipoSel}
              onChange={(e) => setTipoSel(e.target.value)}
            >
              <option value="">Seleccionar tipo de costo…</option>
              {costoTipos.map((t) => <option key={t.id} value={t.id}>{t.tipo}</option>)}
            </select>
            <input
              type="number" step="0.01" placeholder="Cantidad"
              className="impor-san-input"
              value={cantidadCosto}
              onChange={(e) => setCantidadCosto(e.target.value)}
            />
            <button type="button" className="impor-san-btn impor-san-btn-primary" onClick={agregarCosto}>
              Agregar
            </button>
          </div>
        </section>
      </form>
    </section>
  );
}

function formatearFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-EC', {
    month: 'long', day: 'numeric',
  });
}
