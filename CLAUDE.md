# CLAUDE.md — Imporsan Stock

Guía para trabajar en este repositorio. Léela antes de tocar código.

---

## Qué es este proyecto

Herramienta interna de Imporsan para:
1. **Consolidar stock** de múltiples plataformas (Mercado Libre, Amazon, Spakio) subiendo archivos CSV/XLSX.
2. **Gestionar movimientos** de inventario (órdenes, envíos) con sus productos y costos asociados.

No hay autenticación de usuarios. Es una herramienta de uso interno.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 7 (MPA — múltiples HTML) |
| Backend | Python 3.14 + FastAPI (solo parseo de archivos) |
| Base de datos | Supabase (PostgreSQL) |
| Deploy | Vercel (frontend estático + serverless para el backend Python) |

---

## Arquitectura de datos

### Flujo de stock (archivos)
```
Usuario sube archivo → POST /api/stock-actual/upload/{plataforma}
    → Python parsea con pandas
    → retorna { sku: cantidad }
    → frontend guarda en sessionStorage (inventario-store.js)
    → página Stock combina con catálogo de Supabase para mostrar tabla
```

### Flujo CRUD (movimientos, catálogos)
```
Frontend → Supabase JS SDK (anon key + RLS) → PostgreSQL
```

**El backend Python NO interviene en el CRUD.** Todo va directo a Supabase desde el navegador.

---

## Estructura de archivos clave

```
/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx              # Navegación lateral compartida
│   ├── js/
│   │   ├── api.js                   # TODA la comunicación con datos (leer primero)
│   │   ├── supabase.js              # Cliente Supabase (anon key)
│   │   └── inventario-store.js      # sessionStorage para inventario de plataformas
│   └── pages/
│       ├── dropin/                  # Subida de archivos de stock
│       ├── stock/                   # Tabla consolidada de stock
│       ├── movimientos/             # CRUD de movimientos
│       │   ├── Lista.jsx            # Listado con filtros
│       │   └── Detalle.jsx          # Formulario de edición + productos + costos
│       └── ventas/                  # Placeholder (sin implementar)
│
├── backend/
│   ├── main.py                      # App FastAPI — solo 2 módulos activos
│   ├── core/
│   │   ├── config.py                # Lee variables de entorno
│   │   └── supabase.py              # Cliente Supabase con service_role (solo backend)
│   └── modules/
│       ├── health/                  # GET /api/salud
│       └── stock_actual/            # Parseo de archivos + stock comprometido
│           ├── router.py
│           ├── service.py           # Orquesta parseo y descuento de stock comprometido
│           ├── platforms.py         # Configuración de cada plataforma (columnas, formato)
│           ├── processor.py         # Lee el archivo con pandas
│           ├── sku_resolver.py      # Mapea nombres de producto a SKU
│           └── mappings.py          # Tablas de mapeo nombre→SKU
│
├── .env                             # VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
└── backend/.env                     # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (nunca al frontend)
```

---

## Base de datos (Supabase)

### Tablas

| Tabla | Descripción |
|---|---|
| `productos` | Catálogo de productos. Columnas: `id, sku, nombre, modelo, gtin, estado` |
| `estados` | Catálogo de estados de movimiento. Columnas: `id, texto` |
| `costo_tipo` | Tipos de costo. Columnas: `id, tipo` |
| `movimientos` | Órdenes/envíos. FK: `estado → estados.id` |
| `mov_prod` | Productos de un movimiento. FK: `id_movimiento → movimientos.id CASCADE` |
| `mov_costo` | Costos de un movimiento. FK: `id_movimiento → movimientos.id CASCADE` |

### RLS
Todas las tablas tienen RLS habilitado. La `anon` key tiene acceso full CRUD en todas las tablas (herramienta interna, sin auth). La `service_role` key la usa solo el backend Python.

### Estado "comprometido"
UUID hardcodeado: `f21aa5a4-33d0-419e-aa2a-e10a6369351a`. Los movimientos en este estado descuentan del stock de Spakio al procesar el archivo.

---

## Convenciones de código

### Frontend
- **`api.js` es el único punto de acceso a datos.** Nunca llamar a `supabase` directamente desde un componente. Siempre pasar por las funciones de `api.js`.
- Cada página es una entrada Vite independiente (`index.html` + `main.jsx` + `page.jsx`). No hay react-router.
- La navegación lista↔detalle en Movimientos es estado React local (no cambia la URL). Decisión consciente para herramienta interna.
- Filtros en Movimientos son client-side sobre el array completo. Aceptable para el volumen actual.
- `sessionStorage` (no `localStorage`) para el inventario, así se limpia al cerrar el tab.

### Backend
- El backend solo existe para parsear archivos (pandas). Todo lo demás es Supabase directo.
- Cada módulo es dueño de su persistencia: el service.py de cada módulo llama a Supabase.
- No agregar routers de CRUD al backend. Si hay una nueva tabla en Supabase, la lógica va directo al frontend vía `api.js`.

---

## Comandos de desarrollo

```bash
# Instalar dependencias
npm install
pip install -r backend/requirements.txt   # dentro del venv

# Desarrollo (frontend + backend juntos)
npm run dev

# Solo frontend
npm run dev:frontend

# Solo backend
npm run dev:backend

# Build para producción
npm run build
```

El backend corre en `http://localhost:8000`. El frontend en `http://localhost:5173`.

---

## Variables de entorno

### `.env` (frontend, prefijo VITE_)
```
VITE_API_URL=http://localhost:8000          # URL del backend Python
VITE_SUPABASE_URL=https://...supabase.co    # URL del proyecto Supabase
VITE_SUPABASE_ANON_KEY=eyJ...               # Anon key (segura en el browser)
```

### `backend/.env` (solo backend, NUNCA al frontend)
```
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # Bypasea RLS — tratar como secreto
```

---

## Deploy (Vercel)

- `vercel.json` redirige `/api/*` al serverless Python (`api/index.py`).
- El frontend se sirve como estático desde `dist/`.
- Las variables de entorno `VITE_*` y las del backend deben estar configuradas en el panel de Vercel.

---

## Reglas importantes

1. **No agregar la service_role key al frontend**, nunca. Solo la anon key va en `VITE_*`.
2. **No crear routers FastAPI para CRUD simple.** El frontend habla directamente con Supabase.
3. **No usar `localStorage`** para el inventario de plataformas. Usar `sessionStorage` (ya implementado en `inventario-store.js`).
4. **Si se agrega una tabla nueva en Supabase**, hay que crear la política RLS para `anon` antes de usarla desde el frontend.
5. **`eliminarMovimiento` borra en cascada** `mov_prod` y `mov_costo` por FK. No hace falta borrar manualmente desde el frontend.
