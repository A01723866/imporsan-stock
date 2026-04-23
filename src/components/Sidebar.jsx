/**
 * Sidebar de navegación
 * =====================
 *
 * Menú lateral con los 3 módulos de la app. Se comparte entre todas las
 * páginas. Cada página le pasa su `id` al prop `activo` para resaltar
 * el ítem correspondiente.
 *
 * Cómo agregar un módulo nuevo:
 * 1. Agregá un entry a MENU_ITEMS (id, label, href).
 * 2. Creá la página y su HTML (ver src/ventas.html como ejemplo).
 * 3. Registrá el HTML en vite.config.js.
 */

const MENU_ITEMS = [
  { id: 'dropin', label: 'DropIn', icono: '📥', href: '/src/pages/dropin/' },
  { id: 'stock',  label: 'Stock',  icono: '📦', href: '/src/pages/stock/' },
  { id: 'ventas', label: 'Ventas', icono: '💰', href: '/src/pages/ventas/' },
];

/**
 * @param {{ activo: 'dropin' | 'stock' | 'ventas' }} props
 */
export default function Sidebar({ activo }) {
  return (
    <aside className="impor-san-sidebar" aria-label="Navegación principal">
      <div className="impor-san-sidebar-brand">ImporSan</div>
      <nav className="impor-san-sidebar-nav">
        {MENU_ITEMS.map(({ id, label, icono, href }) => {
          const esActivo = id === activo;
          const clases = [
            'impor-san-sidebar-link',
            esActivo ? 'impor-san-sidebar-link-active' : '',
          ].filter(Boolean).join(' ');

          return (
            <a
              key={id}
              href={href}
              className={clases}
              aria-current={esActivo ? 'page' : undefined}
            >
              <span className="impor-san-sidebar-icon" aria-hidden="true">{icono}</span>
              <span className="impor-san-sidebar-label">{label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
