/**
 * Página de Movimientos
 * =====================
 *
 * Vista única (sin router) que alterna entre lista y detalle vía estado
 * React. Click en una fila → guarda el id en `vista` y se renderiza el
 * detalle. Botón "Volver" → vuelve a la lista.
 *
 * Trade-off (decisión consciente):
 *   - URL no cambia entre lista y detalle. No se puede compartir un link
 *     directo a un movimiento. Para una herramienta interna está OK.
 */

import { useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import Lista from './Lista.jsx';
import Detalle from './Detalle.jsx';

export default function MovimientosPage() {
  const [vista, setVista] = useState({ tipo: 'lista' });

  return (
    <div className="impor-san-layout">
      <Sidebar activo="movimientos" />

      <main className="impor-san-page">
        {vista.tipo === 'lista' && (
          <Lista onAbrirDetalle={(id) => setVista({ tipo: 'detalle', id })} />
        )}
        {vista.tipo === 'detalle' && (
          <Detalle
            id={vista.id}
            onVolver={() => setVista({ tipo: 'lista' })}
          />
        )}
      </main>
    </div>
  );
}
