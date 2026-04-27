/**
 * Detalle de un movimiento.
 *
 * - Edita los campos del movimiento (PATCH).
 * - Tabla de productos asociados (mov_prod): agregar / eliminar / editar cantidad.
 * - Tabla de costos asociados (mov_costo): agregar / eliminar.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  actualizarMovimiento,
  crearMovCosto,
  crearMovProd,
  actualizarMovProd,
  eliminarMovCosto,
  eliminarMovProd,
  obtenerCostoTipos,
  obtenerEstados,
  obtenerMovCosto,
  obtenerMovimiento,
  obtenerMovProd,
  obtenerProductos,
} from '../../js/api.js';
const ESTADOS_DISPONIBLES = new Set(['Activo', 'En Liquidación']);

const CANALES = ['B2C', 'B2B'];

export default function Detalle({ id, onVolver }) {
  const [movimiento, setMovimiento] = useState(null);
  const [estados, setEstados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [costoTipos, setCostoTipos] = useState([]);
  const [movProd, setMovProd] = useState([]);
  const [movCosto, setMovCosto] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const recargarLineas = () =>
    Promise.all([obtenerMovProd(id), obtenerMovCosto(id)])
      .then(([prods, costos]) => {
        setMovProd(prods);
        setMovCosto(costos);
      });

  useEffect(() => {
    setCargando(true);
    Promise.all([
      obtenerMovimiento(id),
      obtenerEstados(),
      obtenerProductos(),
      obtenerCostoTipos(),
      obtenerMovProd(id),
      obtenerMovCosto(id),
    ])
      .then(([mov, ests, prods, ctipos, mp, mc]) => {
        setMovimiento(mov);
        setEstados(ests);
        setProductos(prods);
        setCostoTipos(ctipos);
        setMovProd(mp);
        setMovCosto(mc);
        setError('');
      })
      .catch((e) => setError(e.message ?? 'Error al cargar el detalle.'))
      .finally(() => setCargando(false));
  }, [id]);

  const productoPorId = useMemo(
    () => Object.fromEntries(productos.map((p) => [p.id, p])),
    [productos],
  );
  const tipoPorId = useMemo(
    () => Object.fromEntries(costoTipos.map((t) => [t.id, t.tipo])),
    [costoTipos],
  );

  if (cargando) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando…</p>;
  }
  if (error) {
    return (
      <>
        <button type="button" onClick={onVolver}>← Volver</button>
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      </>
    );
  }
  if (!movimiento) return null;

  const handleGuardar = async (cambios) => {
    try {
      const actualizado = await actualizarMovimiento(id, cambios);
      setMovimiento(actualizado);
      alert('Movimiento actualizado.');
    } catch (e) {
      alert(`No se pudo actualizar: ${e.message}`);
    }
  };

  const handleAgregarProducto = async (id_producto, cantidad) => {
    try {
      await crearMovProd({ id_movimiento: id, id_producto, cantidad: Number(cantidad) });
      await recargarLineas();
    } catch (e) {
      alert(`No se pudo agregar: ${e.message}`);
    }
  };

  const handleActualizarProducto = async (movProdId, cantidad) => {
    const siguiente = Number(cantidad);
    const filaActual = movProd.find((x) => x.id === movProdId);
    if (filaActual != null && Number(filaActual.cantidad) === siguiente) {
      return;
    }
    try {
      await actualizarMovProd(movProdId, { cantidad: siguiente });
      await recargarLineas();
    } catch (e) {
      alert(`No se pudo actualizar: ${e.message}`);
    }
  };

  const handleEliminarProducto = async (movProdId) => {
    if (!confirm('¿Eliminar este producto del movimiento?')) return;
    try {
      await eliminarMovProd(movProdId);
      await recargarLineas();
    } catch (e) {
      alert(`No se pudo eliminar: ${e.message}`);
    }
  };

  const handleAgregarCosto = async (id_costo, cantidad) => {
    try {
      await crearMovCosto({ id_movimiento: id, id_costo, cantidad: Number(cantidad) });
      await recargarLineas();
    } catch (e) {
      alert(`No se pudo agregar: ${e.message}`);
    }
  };

  const handleEliminarCosto = async (movCostoId) => {
    if (!confirm('¿Eliminar este costo del movimiento?')) return;
    try {
      await eliminarMovCosto(movCostoId);
      await recargarLineas();
    } catch (e) {
      alert(`No se pudo eliminar: ${e.message}`);
    }
  };

  return (
    <>
      <div className="impor-san-page-header">
        <button
          type="button"
          className="impor-san-btn impor-san-btn-ghost"
          onClick={onVolver}
        >
          ← Volver
        </button>
        <h1 className="impor-san-title">{movimiento.nombre}</h1>
        <span className="impor-san-id-badge">{movimiento.id_interno}</span>
      </div>

      <section className="impor-san-card">
        <header className="impor-san-card-header">
          <h2 className="impor-san-card-title">Datos del movimiento</h2>
        </header>
        <FormEditar
          movimiento={movimiento}
          estados={estados}
          onGuardar={handleGuardar}
        />
      </section>

      <section className="impor-san-card">
        <header className="impor-san-card-header">
          <h2 className="impor-san-card-title">Productos del movimiento</h2>
        </header>
        <TablaProductos
          filas={movProd}
          productoPorId={productoPorId}
          productos={productos}
          onAgregar={handleAgregarProducto}
          onEliminar={handleEliminarProducto}
          onEditar={handleActualizarProducto}
        />
      </section>

      <section className="impor-san-card">
        <header className="impor-san-card-header">
          <h2 className="impor-san-card-title">Costos</h2>
        </header>
        <TablaCostos
          filas={movCosto}
          tipoPorId={tipoPorId}
          costoTipos={costoTipos}
          onAgregar={handleAgregarCosto}
          onEliminar={handleEliminarCosto}
        />
      </section>
    </>
  );
}

function FormEditar({ movimiento, estados, onGuardar }) {
  const [nombre, setNombre] = useState(movimiento.nombre);
  const [idInterno, setIdInterno] = useState(movimiento.id_interno);
  const [estado, setEstado] = useState(movimiento.estado);
  const [canal, setCanal] = useState(movimiento.canal);
  const [descripcion, setDescripcion] = useState(movimiento.descripcion ?? '');
  const [notas, setNotas] = useState(movimiento.notas ?? '');

  const submit = (e) => {
    e.preventDefault();
    onGuardar({
      nombre,
      id_interno: idInterno,
      estado,
      canal,
      descripcion: descripcion || null,
      notas: notas || null,
    });
  };

  return (
    <form onSubmit={submit} className="impor-san-form">
      <div className="impor-san-form-grid">
        <label>Nombre<input className="impor-san-input" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></label>
        <label>ID interno<input className="impor-san-input" value={idInterno} onChange={(e) => setIdInterno(e.target.value)} required /></label>
        <label>Estado
          <select className="impor-san-input" value={estado} onChange={(e) => setEstado(e.target.value)}>
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
        <button type="submit" className="impor-san-btn impor-san-btn-primary">Guardar cambios</button>
      </div>
    </form>
  );
}

function TablaProductos({ filas, productoPorId, productos, onAgregar, onEditar, onEliminar }) {
  // IDs de productos ya asignados al movimiento — para excluirlos del catálogo
  const idsAsignados = useMemo(
    () => new Set(filas.map((f) => f.id_producto)),
    [filas],
  );

  return (
    <>
      <ProductosEnMovimiento
        filas={filas}
        productoPorId={productoPorId}
        onEliminar={onEliminar}
        onEditar={onEditar}
      />
      <CatalogoProductos
        productos={productos}
        idsAsignados={idsAsignados}
        onAgregar={onAgregar}
      />
    </>
  );
}

function ProductosEnMovimiento({ filas, productoPorId, onEliminar, onEditar }) {
  /** Borrador local por id de mov_prod; se limpia al guardar o si no hubo cambio. */
  const [cantidadDraftPorMovProdId, setCantidadDraftPorMovProdId] = useState({});

  const getCantidadInputValue = (filaMovProd) =>
    cantidadDraftPorMovProdId[filaMovProd.id] ?? String(filaMovProd.cantidad ?? '');

  const clearCantidadDraft = (movProdId) => {
    setCantidadDraftPorMovProdId((prev) => {
      const siguiente = { ...prev };
      delete siguiente[movProdId];
      return siguiente;
    });
  };

  const handleCantidadBlur = async (filaMovProd) => {
    const raw = cantidadDraftPorMovProdId[filaMovProd.id] ?? String(filaMovProd.cantidad ?? '');
    const nuevaCantidad = Number(raw);
    const cantidadOriginal = Number(filaMovProd.cantidad);

    if (Number.isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
      clearCantidadDraft(filaMovProd.id);
      alert('La cantidad debe ser un número mayor a 0.');
      return;
    }
    if (nuevaCantidad === cantidadOriginal) {
      clearCantidadDraft(filaMovProd.id);
      return;
    }
    await onEditar(filaMovProd.id, nuevaCantidad);
    clearCantidadDraft(filaMovProd.id);
  };

  if (filas.length === 0) {
    return (
      <p className="impor-san-empty">
        Aún no hay productos en este movimiento. Agregá desde el catálogo de abajo.
      </p>
    );
  }
  return (
    <table className="impor-san-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th>SKU</th>
          <th className="impor-san-table-num">Cantidad</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {filas.map((f) => {
          const p = productoPorId[f.id_producto];
          return (
            <tr key={f.id}>
              <td>{p?.nombre ?? '—'}</td>
              <td className="impor-san-table-mono">{p?.sku ?? '—'}</td>
              <td className="impor-san-table-num">
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="impor-san-input impor-san-input-num"
                  aria-label={`Cantidad de ${p?.nombre ?? 'producto'}`}
                  value={getCantidadInputValue(f)}
                  onChange={(e) =>
                    setCantidadDraftPorMovProdId((prev) => ({
                      ...prev,
                      [f.id]: e.target.value,
                    }))
                  }
                  onBlur={() => void handleCantidadBlur(f)}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="impor-san-btn impor-san-btn-danger"
                  onClick={() => onEliminar(f.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CatalogoProductos({ productos, idsAsignados, onAgregar }) {
  const [busqueda, setBusqueda] = useState('');
  // cantidad por id de producto: { [productoId]: '3' }
  const [cantidades, setCantidades] = useState({});

  // Solo productos disponibles para asignar:
  //   - estado "Activo" o "En Liquidación"
  //   - no asignados aún a este movimiento
  // Encima se aplica la búsqueda por nombre/SKU.
  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      if (!ESTADOS_DISPONIBLES.has(p.estado)) return false;
      if (idsAsignados.has(p.id)) return false;
      if (texto) {
        const haystack = `${p.nombre ?? ''} ${p.sku ?? ''}`.toLowerCase();
        if (!haystack.includes(texto)) return false;
      }
      return true;
    });
  }, [productos, idsAsignados, busqueda]);

  const setCantidad = (id, valor) =>
    setCantidades((prev) => ({ ...prev, [id]: valor }));

  const handleAgregar = (productoId) => {
    const cantidad = Number(cantidades[productoId]);
    if (!cantidad || cantidad <= 0) {
      alert('Indicá una cantidad mayor a 0.');
      return;
    }
    onAgregar(productoId, cantidad);
    setCantidad(productoId, '');
  };

  return (
    <section className="impor-san-card" style={{ marginTop: '1rem' }}>
      <header className="impor-san-card-header">
        <h3 className="impor-san-card-title">Catálogo de productos</h3>
        <div className="impor-san-card-actions">
          <input
            type="search"
            placeholder="Buscar por nombre o SKU…"
            className="impor-san-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

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
          {filtrados.length === 0 ? (
            <tr>
              <td colSpan={4} className="impor-san-empty-row">
                Sin productos disponibles.
              </td>
            </tr>
          ) : (
            filtrados.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre ?? '—'}</td>
                <td className="impor-san-table-mono">{p.sku ?? '—'}</td>
                <td className="impor-san-table-num">
                  <input
                    type="number"
                    min="1"
                    className="impor-san-input impor-san-input-num"
                    value={cantidades[p.id] ?? ''}
                    onChange={(e) => setCantidad(p.id, e.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="impor-san-btn impor-san-btn-primary"
                    onClick={() => handleAgregar(p.id)}
                  >
                    Agregar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

function TablaCostos({ filas, tipoPorId, costoTipos, onAgregar, onEliminar }) {
  const [tipoSel, setTipoSel] = useState('');
  const [cantidad, setCantidad] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!tipoSel || !cantidad) return;
    onAgregar(tipoSel, cantidad);
    setTipoSel('');
    setCantidad('');
  };

  return (
    <>
      {filas.length === 0 ? (
        <p className="impor-san-empty">Aún no hay costos en este movimiento.</p>
      ) : (
        <table className="impor-san-table">
          <thead>
            <tr>
              <th>Tipo de costo</th>
              <th className="impor-san-table-num">Cantidad</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id}>
                <td>{tipoPorId[f.id_costo] ?? '—'}</td>
                <td className="impor-san-table-num">{f.cantidad}</td>
                <td>
                  <button
                    type="button"
                    className="impor-san-btn impor-san-btn-danger"
                    onClick={() => onEliminar(f.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={submit} className="impor-san-inline-form">
        <select
          className="impor-san-input"
          value={tipoSel}
          onChange={(e) => setTipoSel(e.target.value)}
          required
        >
          <option value="">Seleccionar tipo de costo…</option>
          {costoTipos.map((t) => (
            <option key={t.id} value={t.id}>{t.tipo}</option>
          ))}
        </select>
        <input
          type="number" step="0.01" placeholder="Cantidad"
          className="impor-san-input"
          value={cantidad} onChange={(e) => setCantidad(e.target.value)} required
        />
        <button type="submit" className="impor-san-btn impor-san-btn-primary">Agregar</button>
      </form>
    </>
  );
}
