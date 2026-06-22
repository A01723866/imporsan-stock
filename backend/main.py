"""
API de Imporsan Stock (FastAPI)
===============================

Punto de entrada. Solo crea la app, configura CORS y monta los routers.

El CRUD de movimientos, productos y catálogos va directo a Supabase desde
el frontend. El backend solo se encarga del parseo de archivos de stock.

Estructura
----------
    modules/
        health/       → GET  /api/salud
        stock_actual/ → POST /api/stock-actual/upload/{plataforma}
                        POST /api/stock-actual/debug/{plataforma}
                        GET  /api/stock-actual/sync/amazon
    integrations/
        amazon/       → GET  /api/integraciones/amazon/token
                        GET  /api/integraciones/amazon/inventario-raw

Ejecución local
---------------
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


from integrations.router import router as integrations_router
from modules.health.router import router as health_router
from modules.stock_actual.router import router as stock_actual_router


app = FastAPI(
    title="Imporsan Stock API",
    description="API para procesar archivos de inventario de MercadoLibre, Amazon y Spakio.",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor."},
        headers={"Access-Control-Allow-Origin": "*"},
    )

app.include_router(health_router, prefix="/api")
app.include_router(stock_actual_router, prefix="/api/stock-actual", tags=["stock-actual"])
app.include_router(integrations_router, prefix="/api/integraciones", tags=["integraciones"])
