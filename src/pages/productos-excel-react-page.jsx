import { useEffect, useState } from 'react';
import {
  downloadProductosExcelCsv,
  getProductos,
  subscribeToProductosChanges,
} from '../js/productos-excel-data.js';

export default function ProductosExcelReactPage() {
  const [productosFilas, setProductosFilas] = useState(() =>
    getProductos().map((filaProducto) => ({ ...filaProducto })),
  );

  useEffect(() => {
    const unsubscribeFromProductosChanges = subscribeToProductosChanges(
      (productosActualizadosSnapshot) => {
        setProductosFilas(productosActualizadosSnapshot);
      },
    );

    return () => {
      unsubscribeFromProductosChanges();
    };
  }, []);

  return (
    <>
      <nav className="impor-san-nav" aria-label="Navegacion principal">
        <a href="../index.html" className="impor-san-nav-link">
          Carga de archivos
        </a>
        <a href="productos-excel.html" className="impor-san-nav-link impor-san-nav-link-current">
          Productos
        </a>
      </nav>

      <main className="impor-san-page impor-san-excel-page">
        <h1 className="impor-san-title">Productos</h1>
        <p className="impor-san-subtitle">Vista tipo hoja de calculo</p>
        <div className="impor-san-run-wrap">
          <button
            id="impor-san-productos-excel-download-button"
            className="impor-san-run-button"
            type="button"
            onClick={() => downloadProductosExcelCsv()}
          >
            Descargar CSV
          </button>
        </div>

        <div className="impor-san-excel-wrap">
          <div className="impor-san-excel-scroll">
            <table className="impor-san-excel-grid" role="grid" aria-label="Tabla de productos">
              <thead>
                <tr>
                  <th className="impor-san-excel-corner" scope="col"></th>
                  <th className="impor-san-excel-col-header" scope="col">
                    Nombre
                  </th>
                  <th className="impor-san-excel-col-header" scope="col">
                    SKU
                  </th>
                  <th className="impor-san-excel-col-header" scope="col">
                    Mercado Libre
                  </th>
                  <th className="impor-san-excel-col-header" scope="col">
                    Amazon
                  </th>
                  <th className="impor-san-excel-col-header" scope="col">
                    Spakio
                  </th>
                  <th className="impor-san-excel-col-header" scope="col">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody id="impor-san-productos-excel-tbody">
                {productosFilas.map((filaProducto, index) => (
                  <tr key={`${filaProducto.sku || 'sin-sku'}-${index}`}>
                    <th className="impor-san-excel-row-header" scope="row">
                      {index + 1}
                    </th>
                    <td className="impor-san-excel-cell">{filaProducto.nombre ?? ''}</td>
                    <td className="impor-san-excel-cell">{filaProducto.sku ?? ''}</td>
                    <td className="impor-san-excel-cell">{filaProducto.mercadolibre ?? ''}</td>
                    <td className="impor-san-excel-cell">{filaProducto.amazon ?? ''}</td>
                    <td className="impor-san-excel-cell">{filaProducto.spakio ?? ''}</td>
                    <td className="impor-san-excel-cell">{filaProducto.total ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
