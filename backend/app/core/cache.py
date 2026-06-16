from datetime import datetime, timedelta

_cache: dict = {}


def get_cache(key: str):
    """Retorna o valor cacheado se ainda não expirou, senão retorna None."""
    entry = _cache.get(key)
    if entry and entry["expira_em"] > datetime.utcnow():
        return entry["valor"]
    return None


def set_cache(key: str, valor, ttl_horas: int = 24):
    """Armazena um valor no cache com TTL em horas (padrão: 24h)."""
    _cache[key] = {
        "valor": valor,
        "expira_em": datetime.utcnow() + timedelta(hours=ttl_horas),
    }


def invalidar_cache(key: str):
    """Remove uma entrada do cache manualmente."""
    _cache.pop(key, None)
