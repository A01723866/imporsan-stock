/**
 * Capa de acceso a datos de Imporsan Stock.
 *
 * La mayoría de operaciones van directo a Supabase usando el cliente JS
 * (anon key + RLS). La única excepción es `subirArchivo`, que manda el
 * archivo al backend Python para su parseo.
 */

import { supabase } from './supabase.js';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lanzarSiError({ error, data }) {
  if (error) throw new Error(error.message);
  return data;
}


// ---------------------------------------------------------------------------
// stock_actual — sigue pasando por el backend Python (parseo de archivos)
// ---------------------------------------------------------------------------

export async function subirArchivo(plataforma, archivo) {
  const formData = new FormData();
  formData.append('archivo', archivo);

  const respuesta = await fetch(`${API_BASE}/api/stock-actual/upload/${plataforma}`, {
    method: 'POST',
    body: formData,
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => ({}));
    throw new Error(detalle?.detail ?? `Error ${respuesta.status} al procesar el archivo.`);
  }

  return respuesta.json();
}


// Cache de sesión + dedupe de in-flight: cada endpoint se pide UNA vez por tab.
const _inflight = new Map();
function cacheSesion(clave, fn) {
  const guardado = sessionStorage.getItem(clave);
  if (guardado) return Promise.resolve(JSON.parse(guardado));
  if (_inflight.has(clave)) return _inflight.get(clave);
  const p = fn().then((data) => {
    try { sessionStorage.setItem(clave, JSON.stringify(data)); } catch (_) {}
    _inflight.delete(clave);
    return data;
  }).catch((e) => { _inflight.delete(clave); throw e; });
  _inflight.set(clave, p);
  return p;
}

export const obtenerReporteInventarioFba = (forzar_nuevo = false) =>
  cacheSesion(`cache:fba:${forzar_nuevo}`, () =>
    fetch(`${API_BASE}/api/integraciones/reporte-inventario-fba?forzar_nuevo=${forzar_nuevo}`)
      .then(r => {
        if (!r.ok) throw new Error(`Error ${r.status} al obtener el reporte de inventario FBA.`);
        return r.json();
      }));

// Productos comprometidos (estado Comprometido) en Mercado Libre o Amazon.
// Se contrastan contra los "listos" del archivo de marklog en la verificación.
const _ESTADO_COMPROMETIDO = 'f21aa5a4-33d0-419e-aa2a-e10a6369351a';
const _ESTADO_RECLAMO      = 'd2173d71-9311-40c4-9d8c-36a97233c594';

export const obtenerComprometidos = () =>
  supabase
    .from('mov_prod')
    .select(`
      id,
      cantidad,
      productos!inner(sku, nombre),
      mov:movimientos!mov_prod_id_movimiento_fkey!inner(id, id_interno, nombre, plataforma, estado)
    `)
    .in('mov.plataforma', ['Mercado Libre', 'Amazon'])
    .eq('mov.estado', _ESTADO_COMPROMETIDO)
    .then(lanzarSiError);

// Envíos en reclamo de Mercado Libre — para ajustar el stock de meli
// con la diferencia entre cantidad enviada e ingresada.
export const obtenerReclamosMeli = () =>
  supabase
    .from('mov_prod')
    .select(`
      id,
      cantidad,
      productos!inner(sku, nombre),
      mov:movimientos!mov_prod_id_movimiento_fkey!inner(id, id_interno, nombre, plataforma, estado)
    `)
    .eq('mov.plataforma', 'Mercado Libre')
    .eq('mov.estado', _ESTADO_RECLAMO)
    .then(lanzarSiError);


// ---------------------------------------------------------------------------
// productos
// ---------------------------------------------------------------------------

export const obtenerProductos = () =>
  supabase
    .from('productos')
    .select('id, sku, nombre, modelo, gtin, estado')
    .then(lanzarSiError);


// ---------------------------------------------------------------------------
// movimientos
// ---------------------------------------------------------------------------

const SEL_MOV = 'id, nombre, id_interno, estado, canal, plataforma, descripcion, notas, fecha_creacion, fecha_modificacion';

export const obtenerMovimientos = () =>
  supabase.from('movimientos').select(SEL_MOV).then(lanzarSiError);

export const obtenerMovimiento = (id) =>
  supabase
    .from('movimientos')
    .select(SEL_MOV)
    .eq('id', id)
    .single()
    .then(lanzarSiError);

export const crearMovimiento = (datos) =>
  supabase
    .from('movimientos')
    .insert(datos)
    .select(SEL_MOV)
    .single()
    .then(lanzarSiError);

export const actualizarMovimiento = (id, cambios) =>
  supabase
    .from('movimientos')
    .update(cambios)
    .eq('id', id)
    .select(SEL_MOV)
    .single()
    .then(lanzarSiError);

export const eliminarMovimiento = (id) =>
  // mov_prod y mov_costo se borran en cascada por FK
  supabase
    .from('movimientos')
    .delete()
    .eq('id', id)
    .then(({ error }) => { if (error) throw new Error(error.message); });


// ---------------------------------------------------------------------------
// estados (catálogo)
// ---------------------------------------------------------------------------

export const obtenerEstados = () =>
  supabase.from('estados').select('id, texto').then(lanzarSiError);


// ---------------------------------------------------------------------------
// costo_tipo (catálogo)
// ---------------------------------------------------------------------------

export const obtenerCostoTipos = () =>
  supabase.from('costo_tipo').select('id, tipo').then(lanzarSiError);


// ---------------------------------------------------------------------------
// mov_prod
// ---------------------------------------------------------------------------

const SEL_MOV_PROD = 'id, id_movimiento, id_producto, cantidad';

export const obtenerMovProd = (idMovimiento) => {
  const q = supabase.from('mov_prod').select(SEL_MOV_PROD);
  return (idMovimiento ? q.eq('id_movimiento', idMovimiento) : q).then(lanzarSiError);
};

export const crearMovProd = (datos) =>
  supabase
    .from('mov_prod')
    .insert(datos)
    .select(SEL_MOV_PROD)
    .single()
    .then(lanzarSiError);

export const actualizarMovProd = (id, cambios) =>
  supabase
    .from('mov_prod')
    .update(cambios)
    .eq('id', id)
    .select(SEL_MOV_PROD)
    .single()
    .then(lanzarSiError);

export const eliminarMovProd = (id) =>
  supabase
    .from('mov_prod')
    .delete()
    .eq('id', id)
    .then(({ error }) => { if (error) throw new Error(error.message); });


// ---------------------------------------------------------------------------
// mov_costo
// ---------------------------------------------------------------------------

const SEL_MOV_COSTO = 'id, id_movimiento, id_costo, cantidad';

export const obtenerMovCosto = (idMovimiento) => {
  const q = supabase.from('mov_costo').select(SEL_MOV_COSTO);
  return (idMovimiento ? q.eq('id_movimiento', idMovimiento) : q).then(lanzarSiError);
};

export const crearMovCosto = (datos) =>
  supabase
    .from('mov_costo')
    .insert(datos)
    .select(SEL_MOV_COSTO)
    .single()
    .then(lanzarSiError);

export const eliminarMovCosto = (id) =>
  supabase
    .from('mov_costo')
    .delete()
    .eq('id', id)
    .then(({ error }) => { if (error) throw new Error(error.message); });
