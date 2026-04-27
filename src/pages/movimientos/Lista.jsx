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
  crearMovimiento,
  eliminarMovimiento,
  obtenerEstados,
  obtenerMovimientos,
} from '../../js/api.js';

const CANALES = ['B2C', 'B2B'];

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

  const estadoPorId = useMemo(
    () => Object.fromEntries(estados.map((e) => [e.id, e.texto])),
    [estados],
  );

  const filas = useMemo(() => {
    return movimientos.filter((m) => {
      if (filtroEstado && m.estado !== filtroEstado) return false;
      if (filtroCanal && m.canal !== filtroCanal) return false;
      if (fechaDesde && m.fecha_creacion < fechaDesde) return false;
      if (fechaHasta && m.fecha_creacion > `${fechaHasta}T23:59:59`) return false;
      return true;
    });
  }, [movimientos, filtroEstado, filtroCanal, fechaDesde, fechaHasta]);

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este movimiento? No se puede deshacer.')) return;
    try {
      await eliminarMovimiento(id);
      recargar();
    } catch (e) {
      alert(`No se pudo eliminar: ${e.message}`);
    }
  };

  const handleCrear = async (datos) => {
    try {
      await crearMovimiento(datos);
      setMostrarForm(false);
      recargar();
    } catch (e) {
      alert(`No se pudo crear: ${e.message}`);
    }
  };

  return (
    <>
      <div className="impor-san-page-header">
        <h1 className="impor-san-title">Movimientos</h1>
        <p className="impor-san-subtitle">Listado de movimientos de inventario</p>
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
              <th>Estado</th>
              <th>Canal</th>
              <th>Creado</th>
              <th>Modificado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={7} className="impor-san-empty-row">Cargando…</td></tr>
            ) : filas.length === 0 ? (
              <tr><td colSpan={7} className="impor-san-empty-row">Sin movimientos.</td></tr>
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
                  <td>{estadoPorId[m.estado] ?? '—'}</td>
                  <td><span className="impor-san-pill">{m.canal}</span></td>
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

function FormCrear({ estados, onCrear, onCancelar }) {
  const [nombre, setNombre] = useState('');
  const [idInterno, setIdInterno] = useState('');
  const [estado, setEstado] = useState('');
  const [canal, setCanal] = useState('B2C');
  const [descripcion, setDescripcion] = useState('');
  const [notas, setNotas] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!nombre || !idInterno || !estado) {
      alert('Nombre, ID interno y Estado son obligatorios.');
      return;
    }
    onCrear({
      nombre,
      id_interno: idInterno,
      estado,
      canal,
      descripcion: descripcion || null,
      notas: notas || null,
    });
  };

  return (
    <section className="impor-san-card">
      <header className="impor-san-card-header">
        <h2 className="impor-san-card-title">Nuevo movimiento</h2>
      </header>
      <form onSubmit={submit} className="impor-san-form">
        <div className="impor-san-form-grid">
          <label>Nombre<input className="impor-san-input" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></label>
          <label>ID interno<input className="impor-san-input" value={idInterno} onChange={(e) => setIdInterno(e.target.value)} required /></label>
          <label>Estado
            <select className="impor-san-input" value={estado} onChange={(e) => setEstado(e.target.value)} required>
              <option value="">Seleccionar…</option>
              {estados.map((es) => <option key={es.id} value={es.id}>{es.texto}</option>)}
            </select>
          </label>
          <label>Canal
            <select className="impor-san-input" value={canal} onChange={(e) => setCanal(e.target.value)}>
              {CANALES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="impor-san-form-full">Descripción
            <textarea className="impor-san-input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </label>
          <label className="impor-san-form-full">Notas
            <textarea className="impor-san-input" value={notas} onChange={(e) => setNotas(e.target.value)} />
          </label>
        </div>
        <div className="impor-san-form-actions">
          <button type="submit" className="impor-san-btn impor-san-btn-primary">Crear</button>
          <button type="button" className="impor-san-btn impor-san-btn-ghost" onClick={onCancelar}>Cancelar</button>
        </div>
      </form>
    </section>
  );
}

function formatearFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-EC', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}
