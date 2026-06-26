"""Smoke tests: POST /api/stock-actual/upload/{plataforma} debe responder 200."""

from __future__ import annotations

import pytest

from modules.stock_actual import service
from tests.fixture_bytes import PLATAFORMAS_UPLOAD, leer_fixture_plataforma


class TestUploadEndpoint:
    def test_upload_responde_200_sin_error(
        self, cliente_api, plataforma_upload: str
    ) -> None:
        contenido = leer_fixture_plataforma(plataforma_upload)
        nombre = (
            "sample.xlsx"
            if plataforma_upload == "mercadolibre"
            else "sample.csv"
        )

        respuesta = cliente_api.post(
            f"/api/stock-actual/upload/{plataforma_upload}",
            files={"archivo": (nombre, contenido)},
        )

        assert respuesta.status_code == 200, respuesta.text
        cuerpo = respuesta.json()
        assert cuerpo["plataforma"] == plataforma_upload
        assert isinstance(cuerpo["inventario"], dict)
        assert isinstance(cuerpo["productos_encontrados"], int)


class TestUploadService:
    @pytest.mark.parametrize("plataforma", PLATAFORMAS_UPLOAD)
    def test_procesar_inventario_no_lanza(self, plataforma: str) -> None:
        contenido = leer_fixture_plataforma(plataforma)
        inventario = service.procesar_inventario(plataforma, contenido)
        assert isinstance(inventario, dict)


class TestUploadErroresHttp:
    def test_plataforma_desconocida_400(self, cliente_api) -> None:
        respuesta = cliente_api.post(
            "/api/stock-actual/upload/no-existe",
            files={"archivo": ("x.csv", b"a,b\n")},
        )
        assert respuesta.status_code == 400

    def test_archivo_vacio_422(self, cliente_api) -> None:
        respuesta = cliente_api.post(
            "/api/stock-actual/upload/amazon",
            files={"archivo": ("vacio.csv", b"")},
        )
        assert respuesta.status_code == 422
