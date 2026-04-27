"""
API de Imporsan Stock (FastAPI)
===============================

Punto de entrada. Solo crea la app, configura CORS y monta los routers
de cada módulo. La lógica vive en `modules/<dominio>/`.

Estructura
----------
    modules/
        health/              → GET  /api/salud
        productos/           → GET  /api/productos
        movimientos/         → CRUD /api/movimientos
            estados/         → CRUD /api/movimientos/estados
            costo_tipo/      → CRUD /api/movimientos/costo-tipo
            mov_prod/        → CRUD /api/movimientos/productos
            mov_costo/       → CRUD /api/movimientos/costos
        stock_actual/        → POST /api/stock-actual/upload/{plataforma}
                               POST /api/stock-actual/debug/{plataforma}

Ejecución local
---------------
    uvicorn main:app --reload --port 8000

Documentación interactiva en http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from modules.health.router import router as health_router
from modules.movimientos.costo_tipo.router import router as costo_tipo_router
from modules.movimientos.estados.router import router as estados_router
from modules.movimientos.mov_costo.router import router as mov_costo_router
from modules.movimientos.mov_prod.router import router as mov_prod_router
from modules.movimientos.router import router as movimientos_router
from modules.productos.router import router as productos_router
from modules.stock_actual.router import router as stock_actual_router


app = FastAPI(
    title="Imporsan Stock API",
    description=(
        "API para consolidar inventario desde MercadoLibre, Amazon y Spakio."
    ),
    version="2.0.0",
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

# Montaje de routers. Cada módulo trae su propio APIRouter; aquí se les
# asigna el prefijo de URL.
app.include_router(health_router, prefix="/api")
app.include_router(productos_router, prefix="/api/productos", tags=["productos"])

# IMPORTANTE: los sub-routers de /api/movimientos/* deben registrarse ANTES
# del router padre /api/movimientos, porque éste tiene /{movimiento_id} y
# capturaría rutas como /api/movimientos/productos si se monta primero.
app.include_router(
    estados_router,
    prefix="/api/movimientos/estados",
    tags=["movimientos/estados"],
)
app.include_router(
    costo_tipo_router,
    prefix="/api/movimientos/costo-tipo",
    tags=["movimientos/costo-tipo"],
)
app.include_router(
    mov_prod_router,
    prefix="/api/movimientos/productos",
    tags=["movimientos/productos"],
)
app.include_router(
    mov_costo_router,
    prefix="/api/movimientos/costos",
    tags=["movimientos/costos"],
)
app.include_router(movimientos_router, prefix="/api/movimientos", tags=["movimientos"])

app.include_router(stock_actual_router, prefix="/api/stock-actual", tags=["stock-actual"])
