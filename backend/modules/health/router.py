"""
Router del módulo health
========================

Chequeo simple para saber si el servicio está vivo.
"""

from fastapi import APIRouter


router = APIRouter()


@router.get(
    "/salud",
    summary="Chequeo de salud",
    description="Retorna `{'ok': true}` si el servicio está vivo.",
)
def salud() -> dict[str, bool]:
    return {"ok": True}
