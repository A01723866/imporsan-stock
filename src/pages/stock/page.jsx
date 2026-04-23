import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import { obtenerProductos } from '../../js/api.js';
import { leerInventario } from '../../js/inventario-store.js';

/**
 * Combina el catálogo con el inventario por plataforma para producir
 * las filas de la tabla. Los SKUs sin stock en una plataforma quedan en 0.
 */
function construirFilas(catalogo, inventario) {
  return catalogo.map((producto) => {
    const meli   = inventario.mercadolibre[producto.sku] ?? 0;
    const amazon = inventario.amazon[producto.sku]       ?? 0;
    const spakio = inventario.spakio[producto.sku]       ?? 0;
    return {
      ...producto,
      mercadolibre: meli,
      amazon,
      spakio,
      total: meli + amazon + spakio,
    };
  });
}

function descargarCsv(filas) {
  const encabezado = 'nombre,sku,mercadolibre,amazon,spakio,total';
  const cuerpo = filas.map((f) =>
    [f.nombre, f.sku, f.mercadolibre, f.amazon, f.spakio, f.total].join(','),
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

export default function StockPage() {
  const [filas, setFilas]     = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    obtenerProductos()
      .then((catalogo) => {
        const inventario = leerInventario();
        setFilas(construirFilas(catalogo, inventario));
      })
      .catch(() => setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="impor-san-layout">
      <Sidebar activo="stock" />

      <main className="impor-san-page impor-san-excel-page">
        <h1 className="impor-san-title">Stock</h1>
        <p className="impor-san-subtitle">Vista tipo hoja de cálculo</p>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        {!error && (
          <div className="impor-san-run-wrap">
            <button
              type="button"
              className="impor-san-run-button"
              onClick={() => descargarCsv(filas)}
              disabled={cargando}
            >
              Descargar CSV
            </button>
          </div>
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
                  <th className="impor-san-excel-col-header" scope="col">Spakio</th>
                  <th className="impor-san-excel-col-header" scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                      Cargando catálogo...
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
                      <td className="impor-san-excel-cell">{fila.spakio}</td>
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
