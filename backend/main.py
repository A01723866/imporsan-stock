"""
API de Imporsan Stock (FastAPI)
===============================

Backend stateless: cada request se procesa de forma independiente. No hay
base de datos ni estado compartido entre llamadas (la persistencia vendrá
en una fase posterior con Supabase).

Endpoints
---------
GET  /api/productos
    Lista el catálogo base de productos (sku + nombre).

POST /api/upload/{plataforma}
    Recibe un archivo (CSV o XLSX) de la plataforma indicada y retorna el
    inventario extraído: `{sku: stock}`. El cliente es responsable de
    combinar los resultados de las distintas plataformas.

GET  /api/salud
    Chequeo simple de que el servicio está vivo.

Ejecución local
---------------
    uvicorn main:app --reload --port 8000

Documentación interactiva (auto-generada) en:
    http://localhost:8000/docs
"""

from io import BytesIO

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from catalog import CATALOGO_PRODUCTOS
from models import InventarioRespuesta, ProductoRespuesta
from platforms import PLATAFORMAS
from processor import procesar_archivo


app = FastAPI(
    title="Imporsan Stock API",
    description=(
        "API para consolidar inventario desde MercadoLibre, Amazon y Spakio. "
        "Procesa archivos sin guardar estado: cada subida es independiente."
    ),
    version="1.0.0",
)

# CORS: el frontend (Vite dev server o producción) debe poder llamar a la
# API desde otro origen. En desarrollo permitimos todo; en producción
# conviene restringirlo al dominio real del frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get(
    "/api/salud",
    summary="Chequeo de salud",
    description="Retorna `{'ok': true}` si el servicio está vivo.",
)
def salud() -> dict[str, bool]:
    return {"ok": True}


@app.get(
    "/api/productos",
    response_model=list[ProductoRespuesta],
    summary="Listar catálogo base",
    description="Retorna todos los productos del catálogo (solo SKU y nombre).",
)
def listar_productos() -> list[ProductoRespuesta]:
    return [
        ProductoRespuesta(sku=producto.sku, nombre=producto.nombre)
        for producto in CATALOGO_PRODUCTOS
    ]


@app.post(
    "/api/upload/{plataforma}",
    response_model=InventarioRespuesta,
    summary="Procesar archivo de una plataforma",
    description=(
        "Recibe el archivo de inventario de la plataforma indicada "
        "(`mercadolibre`, `amazon` o `spakio`) y retorna el inventario "
        "extraído como diccionario SKU → stock."
    ),
)
async def subir_archivo(
    plataforma: str,
    archivo: UploadFile = File(..., description="Archivo XLSX o CSV de la plataforma"),
) -> InventarioRespuesta:
    configuracion = PLATAFORMAS.get(plataforma)
    if configuracion is None:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Plataforma desconocida: '{plataforma}'. "
                f"Opciones válidas: {sorted(PLATAFORMAS.keys())}"
            ),
        )

    contenido = await archivo.read()
    if not contenido:
        raise HTTPException(status_code=400, detail="El archivo está vacío.")

    try:
        inventario = procesar_archivo(configuracion, contenido)
    except Exception as error:
        raise HTTPException(
            status_code=422,
            detail=f"No se pudo procesar el archivo: {error}",
        )

    return InventarioRespuesta(
        plataforma=plataforma,
        inventario=inventario,
        productos_encontrados=len(inventario),
    )


# ---------------------------------------------------------------------------
# Endpoint de diagnóstico (TEMPORAL)
# ---------------------------------------------------------------------------
# Útil cuando una plataforma no extrae productos esperados: muestra las
# primeras filas que lee pandas, con los índices de columna tal como los
# ve el backend. Permite confirmar si los índices en platforms.py apuntan
# a las columnas correctas.
@app.post(
    "/api/debug/{plataforma}",
    summary="[DEBUG] Ver primeras filas de un archivo",
)
async def debug_archivo(plataforma: str, archivo: UploadFile = File(...)):
    configuracion = PLATAFORMAS.get(plataforma)
    if configuracion is None:
        raise HTTPException(status_code=400, detail="Plataforma desconocida")

    contenido = await archivo.read()
    buffer = BytesIO(contenido)

    if configuracion.formato == "xlsx":
        df = pd.read_excel(buffer, header=None, dtype=str)
    else:
        df = pd.read_csv(
            buffer, header=None, dtype=str,
            keep_default_na=False, on_bad_lines="skip",
        )

    return {
        "total_filas": len(df),
        "total_columnas": len(df.columns),
        "columnas_que_usa_el_backend": configuracion.columnas,
        "primeras_5_filas": [
            {f"col_{i}": str(v) for i, v in enumerate(fila)}
            for fila in df.head(5).itertuples(index=False)
        ],
    }
