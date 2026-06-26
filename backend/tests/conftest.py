"""Fixtures compartidos para tests del backend."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from main import app

from tests.fixture_bytes import PLATAFORMAS_UPLOAD


@pytest.fixture
def cliente_api() -> TestClient:
    return TestClient(app)


@pytest.fixture(params=PLATAFORMAS_UPLOAD)
def plataforma_upload(request: pytest.FixtureRequest) -> str:
    return request.param
