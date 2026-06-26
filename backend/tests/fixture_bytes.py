"""Bytes de prueba por plataforma (sintéticos o archivos en fixtures/)."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

import pandas as pd

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"

PLATAFORMAS_UPLOAD = ("mercadolibre", "amazon", "amazon_reserva")

ARCHIVO_POR_PLATAFORMA: dict[str, str] = {
    "mercadolibre": "sample.xlsx",
    "amazon": "sample.csv",
    "amazon_reserva": "sample.csv",
}


def _fila_csv(columnas: int, valores_por_indice: dict[int, str]) -> str:
    celdas = [""] * columnas
    for indice, valor in valores_por_indice.items():
        celdas[indice] = valor
    return ",".join(celdas)


def _generar_bytes_mercadolibre() -> bytes:
    fila = [""] * 27
    fila[3] = "C-BB-DIS-0001"
    fila[21] = "10"
    buffer = BytesIO()
    pd.DataFrame([fila]).to_excel(buffer, index=False, header=False)
    return buffer.getvalue()


def _generar_bytes_amazon() -> bytes:
    linea = _fila_csv(14, {0: "C-BB-DIS-0001", 13: "7"})
    return (linea + "\n").encode("utf-8")


def _generar_bytes_amazon_reserva() -> bytes:
    linea = _fila_csv(6, {0: "C-BB-DIS-0001", 5: "2"})
    return (linea + "\n").encode("utf-8")


_GENERADORES = {
    "mercadolibre": _generar_bytes_mercadolibre,
    "amazon": _generar_bytes_amazon,
    "amazon_reserva": _generar_bytes_amazon_reserva,
}


def leer_fixture_plataforma(plataforma: str) -> bytes:
    nombre = ARCHIVO_POR_PLATAFORMA[plataforma]
    ruta = FIXTURES_DIR / plataforma / nombre
    if ruta.is_file():
        return ruta.read_bytes()
    return _GENERADORES[plataforma]()
