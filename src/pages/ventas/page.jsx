import Sidebar from '../../components/Sidebar.jsx';

/**
 * Página de Ventas (placeholder).
 *
 * Por ahora solo muestra un mensaje. Cuando definamos el flujo de ventas
 * (qué archivo sube el usuario, qué mostramos, etc.) reemplazamos este
 * contenido con la lógica real.
 */
export default function VentasPage() {
  return (
    <div className="impor-san-layout">
      <Sidebar activo="ventas" />
      <main className="impor-san-page">
        <h1 className="impor-san-title">Ventas</h1>
        <p className="impor-san-subtitle">Próximamente</p>
      </main>
    </div>
  );
}
