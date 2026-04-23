"""
Configuración centralizada del backend
======================================

Carga las variables de entorno desde `backend/.env` (o del entorno del
proceso) y las expone como un objeto `settings` tipado.

Todo lo sensible (keys, URLs privadas) vive aquí. Ningún otro módulo
debería leer `os.environ` directamente.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
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
