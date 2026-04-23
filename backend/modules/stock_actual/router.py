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

from fastapi import APIRouter, File, HTTPException, UploadFile

from . import service
from .schemas import InventarioRespuesta


router = APIRouter()


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
        inventario = service.procesar_inventario(plataforma, contenido)
    except service.PlataformaDesconocidaError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except service.ArchivoInvalidoError as error:
        raise HTTPException(status_code=422, detail=str(error))

    return InventarioRespuesta(
        plataforma=plataforma,
        inventario=inventario,
        productos_encontrados=len(inventario),
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
