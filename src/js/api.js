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
