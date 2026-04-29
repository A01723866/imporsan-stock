"""
Router del módulo stock_actual
==============================

Traduce requests HTTP a llamadas al `service`. No contiene lógica de
negocio: valida el input HTTP, delega al service, convierte errores de
dominio en HTTPException y devuelve la respuesta.

Endpoints (montados bajo /api/stock-actual)
-------------------------------------------
POST /upload/{plataforma}
    Procesa un archivo de una plataforma y retorna {sku: stock}.

POST /debug/{plataforma}
    [DIAGNÓSTICO] Muestra las primeras filas del archivo tal como las lee
    pandas, para verificar índices de columna.
"""

from typing import Literal

from fastapi import APIRouter, File, HTTPException, UploadFile

from . import service
from .schemas import InventarioRespuesta, StockComprometidoRespuesta


router = APIRouter()


@router.get(
    "/comprometido",
    response_model=StockComprometidoRespuesta,
    summary="Stock total en estado comprometido (todas las áreas)",
)
def stock_comprometido_total() -> StockComprometidoRespuesta:
    return StockComprometidoRespuesta(area=None, stock=service.stock_comprometido())


@router.get(
    "/comprometido/{area}",
    response_model=StockComprometidoRespuesta,
    summary="Stock comprometido por área: Mercado Libre, Amazon o B2C",
)
def stock_comprometido_por_area(
    area: Literal["Mercado Libre", "Amazon", "B2C"],
) -> StockComprometidoRespuesta:
    return StockComprometidoRespuesta(area=area, stock=service.stock_comprometido(area=area))


@router.post(
    "/upload/{plataforma}",
    response_model=InventarioRespuesta,
    summary="Procesar archivo de una plataforma",
)
async def subir_archivo(
    plataforma: str,
    archivo: UploadFile = File(..., description="Archivo XLSX o CSV de la plataforma"),
) -> InventarioRespuesta:
    contenido = await archivo.read()

    try:
        inventario, warnings = service.procesar_inventario(plataforma, contenido)
    except service.PlataformaDesconocidaError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except service.ArchivoInvalidoError as error:
        raise HTTPException(status_code=422, detail=str(error))

    return InventarioRespuesta(
        plataforma=plataforma,
        inventario=inventario,
        productos_encontrados=len(inventario),
        warnings=warnings,
    )


@router.post(
    "/debug/{plataforma}",
    summary="[DEBUG] Ver primeras filas de un archivo",
)
async def debug_archivo(plataforma: str, archivo: UploadFile = File(...)):
    contenido = await archivo.read()
    try:
        return service.inspeccionar_archivo(plataforma, contenido)
    except service.PlataformaDesconocidaError as error:
        raise HTTPException(status_code=400, detail=str(error))
