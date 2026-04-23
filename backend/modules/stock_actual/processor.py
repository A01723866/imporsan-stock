"""
Motor de procesamiento de archivos
==================================

Esta es la única función que procesa archivos. Lee un archivo de cualquier
plataforma (guiado por su `ConfiguracionPlataforma`) y retorna un diccionario
`{sku_canonico: stock_total}` con el inventario extraído.

Flujo interno
-------------
    archivo crudo (bytes)
        ↓  leer con pandas según formato (xlsx / csv)
    DataFrame
        ↓  para cada fila, extraer columnas configuradas
    dict {"sku": ..., "stock": ...}  (o {"nombre": ..., "stock": ...})
        ↓  resolver → (sku_canonico, multiplicador)
    acumular stock_fila * multiplicador en inventario[sku_canonico]
        ↓
    dict final {sku_canonico: stock_total}

El mismo motor sirve para las 3 plataformas. Para agregar una nueva,
basta con definirla en `platforms.py`.
"""

from io import BytesIO

import pandas as pd

from .platforms import ConfiguracionPlataforma


def procesar_archivo(
    configuracion: ConfiguracionPlataforma,
    contenido: bytes,
) -> dict[str, int]:
    """
    Procesa el archivo de una plataforma y retorna el inventario extraído.

    Parámetros
    ----------
    configuracion:
        Cómo leer el archivo (formato, columnas a extraer, resolver).
    contenido:
        Bytes crudos del archivo subido.

    Retorna
    -------
    Diccionario `{sku_canonico: stock_total}`. Solo contiene los SKUs
    que aparecieron en el archivo y pudieron resolverse.
    """
    dataframe = _leer_archivo(configuracion, contenido)
    inventario: dict[str, int] = {}

    for fila_bruta in dataframe.itertuples(index=False):
        fila = _extraer_columnas(fila_bruta, configuracion.columnas)

        resultado = configuracion.resolver(fila)
        if resultado is None:
            continue

        sku_canonico, multiplicador = resultado
        stock_fila = _a_entero(fila.get("stock"))

        inventario[sku_canonico] = (
            inventario.get(sku_canonico, 0) + stock_fila * multiplicador
        )

    return inventario


# ---------------------------------------------------------------------------
# Helpers internos
# ---------------------------------------------------------------------------

def _leer_archivo(
    configuracion: ConfiguracionPlataforma,
    contenido: bytes,
) -> pd.DataFrame:
    """Lee el archivo en un DataFrame según el formato configurado."""
    buffer = BytesIO(contenido)

    if configuracion.formato == "xlsx":
        return pd.read_excel(
            buffer,
            header=None,
            skiprows=configuracion.saltar_filas,
            dtype=str,
        )

    # csv
    return pd.read_csv(
        buffer,
        header=None,
        skiprows=configuracion.saltar_filas,
        dtype=str,
        keep_default_na=False,
        on_bad_lines="skip",
    )


def _extraer_columnas(fila_bruta, columnas: dict[int, str]) -> dict:
    """
    Convierte una fila del DataFrame (tupla posicional) en un diccionario
    con solo las columnas que nos interesan, usando los nombres lógicos.
    """
    fila = {}
    for indice, nombre_logico in columnas.items():
        if indice < len(fila_bruta):
            fila[nombre_logico] = fila_bruta[indice]
        else:
            fila[nombre_logico] = None
    return fila


def _a_entero(valor) -> int:
    """
    Convierte de forma tolerante cualquier valor a int. Los archivos a
    veces traen '', None, NaN o strings con decimales. Si no se puede
    parsear, retorna 0.
    """
    if valor is None:
        return 0
    try:
        texto = str(valor).strip()
        if not texto:
            return 0
        # Algunos exports traen "12.0" en vez de "12"
        return int(float(texto))
    except (ValueError, TypeError):
        return 0
