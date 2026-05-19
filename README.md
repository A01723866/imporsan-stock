# Imporsan Stock

Herramienta interna para consolidar inventario de **Mercado Libre**, **Amazon** y **Spakio**, y gestionar movimientos de inventario (órdenes, envíos, etc.).

---

## Arquitectura

```
┌─────────────────────────────────┐
│   FRONTEND (React + Vite)       │
│                                 │
│  DropIn → sube archivos         │──── POST /api/stock-actual/upload ────► BACKEND Python
│  Stock  → tabla consolidada     │                                          (parsea CSV/XLSX)
│  Movimientos → CRUD órdenes     │──── Supabase JS SDK (anon key) ────────► SUPABASE (Postgres)
└─────────────────────────────────┘
```

- El **backend Python** (FastAPI) solo existe para parsear archivos de stock con pandas. Todo lo demás va directo a Supabase.
- El **frontend** (React MPA) llama a Supabase con la `anon` key. Las políticas RLS controlan el acceso.
- El inventario por plataforma se guarda en `sessionStorage` del navegador (se limpia al cerrar el tab).

---

## Páginas

| Página | Ruta | Descripción |
|---|---|---|
| DropIn | `/src/pages/dropin/` | Arrastra o selecciona archivos CSV/XLSX de cada plataforma |
| Stock | `/src/pages/stock/` | Tabla consolidada de stock por producto (MeLi + Amazon + Spakio) |
| Movimientos | `/src/pages/movimientos/` | CRUD de órdenes/envíos con productos y costos |
| Ventas | `/src/pages/ventas/` | Placeholder (sin implementar) |

---

## Estructura del repositorio

```
/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx              # Menú lateral compartido entre páginas
│   ├── js/
│   │   ├── api.js                   # Único punto de acceso a datos (leer primero)
│   │   ├── supabase.js              # Cliente Supabase (anon key)
│   │   └── inventario-store.js      # sessionStorage para inventario de plataformas
│   ├── pages/
│   │   ├── dropin/                  # Subida de archivos
│   │   ├── stock/                   # Vista de inventario
│   │   ├── movimientos/
│   │   │   ├── Lista.jsx            # Tabla con filtros + form de alta
│   │   │   └── Detalle.jsx          # Edición + productos + costos del movimiento
│   │   └── ventas/
│   └── style.css
│
├── backend/
│   ├── main.py                      # App FastAPI (health + stock_actual)
│   ├── core/
│   │   ├── config.py                # Lee variables de entorno del backend
│   │   └── supabase.py              # Cliente con service_role (solo para el backend)
│   └── modules/
│       ├── health/                  # GET /api/salud
│       └── stock_actual/
│           ├── router.py            # POST /upload/{plataforma}, GET /comprometido
│           ├── service.py           # Orquesta parseo + descuento de comprometido
│           ├── platforms.py         # Configuración declarativa de cada plataforma
│           ├── processor.py         # Lee archivos con pandas
│           ├── sku_resolver.py      # Mapea nombres/códigos a SKU canónico
│           └── mappings.py          # Tablas de mapeo nombre→SKU, SKU antiguo→nuevo
│
├── .env                             # Variables del frontend (VITE_*)
├── backend/.env                     # Variables del backend (service_role key — secreto)
├── vercel.json                      # Deploy: /api/* → Python, resto → dist/
└── vite.config.js                   # Multi-page: cada página es una entrada Rollup
```

---

## Base de datos (Supabase)

### Tablas

```
productos          id · sku · nombre · modelo · gtin · estado
estados            id · texto
costo_tipo         id · tipo
movimientos        id · nombre · id_interno · estado(FK) · canal · plataforma · descripcion · notas · fecha_creacion · fecha_modificacion
mov_prod           id · id_movimiento(FK CASCADE) · id_producto(FK) · cantidad
mov_costo          id · id_movimiento(FK CASCADE) · id_costo(FK) · cantidad
```

- `mov_prod` y `mov_costo` tienen `ON DELETE CASCADE` en `id_movimiento`. Borrar un movimiento borra sus líneas automáticamente.
- El estado `"comprometido"` (UUID: `f21aa5a4-33d0-419e-aa2a-e10a6369351a`) descuenta unidades del stock de Spakio al procesar el archivo.

### RLS
Todas las tablas tienen RLS activo. La `anon` key tiene CRUD completo (herramienta interna sin autenticación). La `service_role` key solo la usa el backend Python para las queries de stock comprometido.

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Primera vez: crear el venv del backend
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cd ..

# Correr todo junto (backend :8000 + frontend :5173)
npm run dev
```

> El `.env` ya tiene los valores correctos. No hay que configurar nada extra para desarrollo.

---

## Variables de entorno

### `.env` (frontend)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://hozixkwvdkbfuyabimyx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   # Anon key: pública, segura en el browser
```

### `backend/.env` (solo backend)
```
SUPABASE_URL=https://hozixkwvdkbfuyabimyx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Bypasea RLS — nunca al frontend
```

---

## Deploy (Vercel)

```bash
vercel                 # preview
vercel --prod          # producción
```

`vercel.json` redirige `/api/*` a la función serverless Python y sirve el resto como estático desde `dist/`. Las variables de entorno deben estar configuradas en el panel de Vercel.

---

## Flujo de uso

### Consolidar stock
1. Ir a **DropIn** y arrastrar los archivos exportados de cada plataforma (CSV o XLSX).
2. El backend parsea cada archivo y devuelve `{ sku: cantidad }`.
3. Ir a **Stock** para ver la tabla consolidada. Botón **Descargar CSV** para exportar.

### Gestionar movimientos
1. Ir a **Movimientos** y crear un movimiento nuevo (nombre, ID interno, estado, canal).
2. Abrir el detalle del movimiento para agregar productos y costos.
3. Cambiar el estado directamente desde la lista (dropdown inline).

---

## Agregar una plataforma nueva

1. Agregar la configuración en `backend/modules/stock_actual/platforms.py` (nombre de columnas, formato de archivo, estrategia de resolución de SKU).
2. Si hay mapeos especiales (nombres no estándar), agregarlos en `mappings.py`.
3. Agregar la plataforma al array `PLATAFORMAS` en `src/pages/dropin/page.jsx`.
4. Agregar la clave al estado inicial en `src/js/inventario-store.js` si se necesita mostrar como columna separada en Stock.
