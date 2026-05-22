"""
Fixtures compartidos para tests del backend.

Spakio llama a Supabase en upload. Los tests por defecto mockean
`stock_comprometido` para no depender de red ni de `.env`.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from main import app

from tests.fixture_bytes import PLATAFORMAS_UPLOAD


@pytest.fixture
def cliente_api() -> TestClient:
    return TestClient(app)


@pytest.fixture
def mock_stock_comprometido(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "modules.stock_actual.service.stock_comprometido",
        lambda area=None: {},
    )


@pytest.fixture(params=PLATAFORMAS_UPLOAD)
def plataforma_upload(request: pytest.FixtureRequest) -> str:
    return request.param
