"""
Configuración centralizada del backend
======================================

Carga las variables de entorno desde `backend/.env` (o del entorno del
proceso) y las expone como un objeto `settings` tipado.

El `env_file` usa ruta absoluta respecto a este archivo: si uvicorn se
arranca desde la raíz del repo, un `.env` relativo al cwd sería el del
front (solo VITE_*) y fallaría la validación de Supabase; el navegador
a veces muestra eso como error de CORS.

Todo lo sensible (keys, URLs privadas) vive aquí. Ningún otro módulo
debería leer `os.environ` directamente.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Siempre `backend/.env`, no el `.env` de la raíz del monorepo.
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_BACKEND_ENV_FILE = _BACKEND_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_BACKEND_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    supabase_url: str
    supabase_service_role_key: str


@lru_cache
def get_settings() -> Settings:
    """
    Retorna la instancia única de settings. Se usa `lru_cache` para que
    las env vars se lean una sola vez al arrancar el proceso.
    """
    return Settings()
