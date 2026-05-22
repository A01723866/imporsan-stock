"""
Smoke tests: POST /api/stock-actual/upload/{plataforma} debe responder 200.

Spakio usa mock de stock comprometido (ver conftest). Para probar Supabase
real: pytest -m integration (requiere backend/.env).
"""

from __future__ import annotations

import pytest

from modules.stock_actual import service
from tests.fixture_bytes import PLATAFORMAS_UPLOAD, leer_fixture_plataforma


@pytest.mark.usefixtures("mock_stock_comprometido")
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
        assert isinstance(cuerpo["warnings"], list)

    def test_upload_spakio_con_mock_no_llama_supabase(
        self, cliente_api, mock_stock_comprometido
    ) -> None:
        contenido = leer_fixture_plataforma("spakio")
        respuesta = cliente_api.post(
            "/api/stock-actual/upload/spakio",
            files={"archivo": ("sample.csv", contenido)},
        )
        assert respuesta.status_code == 200
        assert respuesta.json()["productos_encontrados"] >= 0


class TestUploadService:
    @pytest.mark.usefixtures("mock_stock_comprometido")
    @pytest.mark.parametrize("plataforma", PLATAFORMAS_UPLOAD)
    def test_procesar_inventario_no_lanza(self, plataforma: str) -> None:
        contenido = leer_fixture_plataforma(plataforma)
        inventario, warnings = service.procesar_inventario(plataforma, contenido)
        assert isinstance(inventario, dict)
        assert isinstance(warnings, list)


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

    def test_stock_comprometido_falla_502_no_500_generico(
        self, cliente_api, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        def _falla():
            raise service.ErrorStockComprometidoError("Supabase no disponible (test)")

        monkeypatch.setattr(
            "modules.stock_actual.service.stock_comprometido", _falla
        )
        contenido = leer_fixture_plataforma("spakio")
        respuesta = cliente_api.post(
            "/api/stock-actual/upload/spakio",
            files={"archivo": ("sample.csv", contenido)},
        )
        assert respuesta.status_code == 502
        assert "Supabase" in respuesta.json()["detail"]


@pytest.mark.integration
def test_upload_spakio_con_supabase_real(cliente_api) -> None:
    """
    Opcional: requiere backend/.env con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
    Ejecutar: npm run test:backend -- -m integration
    """
    contenido = leer_fixture_plataforma("spakio")
    respuesta = cliente_api.post(
        "/api/stock-actual/upload/spakio",
        files={"archivo": ("sample.csv", contenido)},
    )
    assert respuesta.status_code == 200, respuesta.text
