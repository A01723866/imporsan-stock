# Imporsan Stock — Backend

API en Python (FastAPI) que consolida inventario desde MercadoLibre, Amazon y Spakio.

El backend es **stateless**: cada request procesa un archivo y devuelve el resultado. No guarda nada entre llamadas. La combinación de los inventarios de las 3 plataformas se hace en el frontend.

---

## Instalación

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Ejecutar en desarrollo

```bash
uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000
- Documentación interactiva: http://localhost:8000/docs

## Tests (manual, sin CI)

Usa el **venv del proyecto** (`backend/.venv`), no el `pip` global del sistema.

Desde la raíz del repo:

```bash
# Primera vez (instala pytest en el venv, no en Python 3.9 del Mac)
backend/.venv/bin/pip install -r backend/requirements-dev.txt

npm run test:backend
```

Si aún no tienes `.venv`:

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt -r requirements-dev.txt
```

Spakio se prueba con mock de Supabase por defecto. Para incluir Supabase real:

```bash
npm run test:backend:integration
```

Fixtures opcionales: `backend/tests/fixtures/{plataforma}/sample.csv` o `sample.xlsx` (ver README en esa carpeta).

---

## Arquitectura

```
archivo del usuario
      │
      ▼
┌─────────────────────┐
│     main.py         │   FastAPI: recibe el archivo + plataforma
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    platforms.py     │   "¿Cómo se procesa esta plataforma?"
│  ConfiguracionPlata-│   (formato, qué columnas, qué resolver)
│       forma         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    processor.py     │   Motor único. Lee el archivo con pandas,
│  procesar_archivo() │   extrae columnas, pide al resolver el SKU
└─────────┬───────────┘   canónico, acumula stock.
          │
          ▼
┌─────────────────────┐
│   sku_resolver.py   │   Traduce el dato crudo (SKU directo o nombre)
│                     │   al SKU canónico del catálogo de Imporsan.
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    mappings.py      │   Tablas fijas: códigos antiguos, nombres
│                     │   Spakio, kits → base, multiplicadores.
└─────────────────────┘

     ▲
     │  referenciado por la respuesta final
     │
┌─────────────────────┐
│    catalog.py       │   Los 56 productos base (sku + nombre).
└─────────────────────┘
```

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `main.py` | Endpoints FastAPI. Solo orquesta, no tiene lógica de negocio. |
| `models.py` | Modelos Pydantic para validar las respuestas. |
| `platforms.py` | Configuración declarativa de cada plataforma. |
| `processor.py` | Motor único que procesa cualquier plataforma. |
| `sku_resolver.py` | Estrategias para convertir datos crudos → SKU canónico. |
| `mappings.py` | Tablas de mapeo (SKUs antiguos, nombres Spakio, kits). |
| `catalog.py` | Lista maestra de productos. |

**Regla de oro:** si cambia un mapeo, editas `mappings.py`. Si cambia una plataforma, editas `platforms.py`. Si se agrega una plataforma nueva, agregas un entry en `platforms.py` y (si su lógica es distinta) un resolver en `sku_resolver.py`. El `processor.py` no se toca.

---

## Endpoints

### `GET /api/salud`
Chequeo de vida. Retorna `{"ok": true}`.

### `GET /api/productos`
Lista el catálogo base. Retorna:
```json
[
  { "sku": "C-BA-OLI-0200", "nombre": "Barra Z 20 lbs" },
  { "sku": "C-BA-OLI-0210", "nombre": "Barra Z (6.3kg) con bujes" }
]
```

### `POST /api/upload/{plataforma}`
Procesa el archivo subido. `plataforma` puede ser `mercadolibre`, `amazon` o `spakio`.

**Request:** `multipart/form-data` con el campo `archivo`.

**Response:**
```json
{
  "plataforma": "mercadolibre",
  "inventario": {
    "C-BB-DIS-0001": 42,
    "H-WT-LAD-0022": 17
  },
  "productos_encontrados": 2
}
```

---

## Cómo agregar una plataforma nueva

1. Abrí `platforms.py`.
2. Agregá un entry a `PLATAFORMAS` indicando:
   - `formato`: `"xlsx"` o `"csv"`.
   - `columnas`: qué índices de columna leer y cómo se llaman (`"sku"`, `"stock"`, `"nombre"`).
   - `resolver`: función que convierte la fila en `(sku_canonico, multiplicador)`.
   - `saltar_filas`: cuántas filas de encabezado ignorar.
3. Si la lógica de resolución es nueva, agregá un resolver en `sku_resolver.py`.

No hay que tocar `processor.py` ni crear archivos nuevos.

---

## Próximos pasos

- **Fase 2:** adaptar el frontend para que consuma estos endpoints en vez de procesar archivos localmente.
- **Fase 3:** integración con Supabase para persistencia.
