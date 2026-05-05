"""
Cliente Supabase compartido
===========================

Un único cliente para todo el backend. Cada módulo lo importa y hace sus
propias queries en su `service.py` — así el dominio controla su
persistencia sin acoplarse a un repositorio central.

El cliente usa la `service_role` key, que bypasea RLS. El backend es
trusted: autoriza y filtra por su cuenta antes de consultar.

Uso
---
    from core.supabase import get_supabase

    def listar_productos():
        respuesta = get_supabase().table("productos").select("*").execute()
        return respuesta.data
"""

from functools import lru_cache

from supabase import Client, create_client

from .config import get_settings


@lru_cache
def get_supabase() -> Client:
    """
    Retorna el cliente singleton. Se crea la primera vez que se llama y
    se reutiliza en todas las requests siguientes.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
