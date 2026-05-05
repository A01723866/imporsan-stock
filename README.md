# Imporsan Stock

Aplicación interna para consolidar inventario desde **MercadoLibre**, **Amazon** y **Spakio**. El usuario sube los archivos exportados de cada plataforma y la app muestra el stock combinado por producto.

---

## Arquitectura

```
┌───────────────────────────┐                ┌───────────────────────────┐
│   FRONTEND (React + Vite) │   HTTP/JSON    │   BACKEND (FastAPI/Python)│
│                           │ ─────────────► │                           │
│  - Subir archivos         │                │  - Parsear CSV / XLSX     │
│  - Mostrar tabla          │ ◄───────────── │  - Resolver SKUs          │
│  - Descargar CSV          │                │  - Devolver inventario    │
└───────────────────────────┘                └───────────────────────────┘
        :5173                                          :8000
```

**Backend stateless:** cada request procesa un archivo y devuelve el resultado. No hay base de datos (vendrá después con Supabase). El estado entre páginas vive en `sessionStorage` del navegador.

---

## Estructura del repositorio

```
.
├── backend/                  # API en Python (FastAPI)
│   ├── main.py               # Endpoints HTTP
│   ├── platforms.py          # Config declarativa de cada plataforma
│   ├── processor.py          # Motor único de procesamiento
│   ├── sku_resolver.py       # Estrategias para identificar productos
│   ├── mappings.py           # Tablas de mapeo de SKUs
│   ├── catalog.py            # Lista maestra de productos
│   ├── models.py             # Schemas Pydantic
│   └── README.md             # Documentación del backend
│
├── src/                      # Frontend (React)
│   ├── pages/                # Una carpeta por página
│   │   ├── dropin/           # Subir archivos CSV/XLSX
│   │   │   ├── index.html    # HTML de la página
│   │   │   ├── main.jsx      # Entry point (monta React)
│   │   │   └── page.jsx      # Componente visual
│   │   ├── stock/            # Ver inventario consolidado
│   │   │   ├── index.html
│   │   │   ├── main.jsx
│   │   │   └── page.jsx
│   │   └── ventas/           # Placeholder por ahora
│   │       ├── index.html
│   │       ├── main.jsx
│   │       └── page.jsx
│   ├── components/
│   │   └── Sidebar.jsx       # Menú lateral compartido
│   ├── js/
│   │   ├── api.js            # Cliente HTTP (única vía al backend)
│   │   └── inventario-store.js  # Estado en sessionStorage
│   └── style.css
│
├── .env.example              # Variables de entorno (copiar a .env)
└── package.json
```

---

## Cómo correrlo en desarrollo

Necesitas dos terminales: una para el backend y otra para el frontend.

### Terminal 1 — Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API: http://localhost:8000  
Docs interactivas: http://localhost:8000/docs

### Terminal 2 — Frontend

```bash
cp .env.example .env       # solo la primera vez
npm install
npm run dev
```

Frontend: http://localhost:5173

---

## Flujo de uso

1. Abrí el frontend en el navegador.
2. Arrastrá los archivos exportados de cada plataforma a su zona correspondiente.
3. El frontend manda cada archivo al backend (`POST /api/upload/{plataforma}`).
4. El backend procesa, resuelve SKUs y devuelve `{ sku: stock }`.
5. El frontend guarda el resultado en `sessionStorage` y lo muestra combinado en la página de **Productos**.
6. Botón **Descargar CSV** exporta la tabla consolidada.

---

## Cómo agregar un producto o un mapeo nuevo

| Cambio | Archivo |
|---|---|
| Producto nuevo en el catálogo | `backend/catalog.py` |
| Código antiguo Spakio → SKU | `backend/mappings.py` (`SKU_ANTIGUO_A_NUEVO`) |
| Nombre exacto Spakio → SKU | `backend/mappings.py` (`NOMBRE_SPAKIO_A_SKU`) |
| Kit que se suma al base | `backend/mappings.py` (`KITS_A_BASE`) |
| Plataforma nueva | `backend/platforms.py` |

Más detalles en [`backend/README.md`](backend/README.md).

---

## Próximos pasos

- **Fase 3:** integrar Supabase para persistir inventario y catálogo.
- Restringir CORS al dominio real del frontend en producción.
- Deploy: backend en Railway/Render, frontend en Vercel.
