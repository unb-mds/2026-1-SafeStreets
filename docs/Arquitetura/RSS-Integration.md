# RSS Feed Integration — SafeStreets

> Especificação técnica da integração com RSS Portal de Notícia Correio Braziliense

---

## Propósito

Este documento descreve como o SafeStreets coleta, parseia e transforma notícias do feed RSS (Portal de Notícia Correio Braziliense) em Ocorrências estruturadas para visualização.

---

## Feed RSS: Portal de Notícia Correio Braziliense

### URL do Feed
```
https://www.correiobraziliense.com.br/rss/
```

### Estrutura XML Esperada

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Correio Braziliense</title>
    <link>https://www.correiobraziliense.com.br</link>
    <description>Notícias do Correio Braziliense</description>
    
    <item>
      <title>Roubo em Taguatinga deixa dois feridos</title>
      <link>https://www.correiobraziliense.com.br/.../roubo-taguatinga-12345</link>
      <description>
        Dois homens foram assaltados na QNL 02 de Taguatinga na noite de ontem...
      </description>
      <pubDate>Fri, 06 Jun 2026 14:30:00 GMT</pubDate>
      <guid>https://www.correiobraziliense.com.br/.../roubo-taguatinga-12345</guid>
      <category>Segurança</category>
    </item>
    
    <!-- ... mais items ... -->
  </channel>
</rss>
```

---

## Pipeline de Processamento

### 1. Coleta (Fetch RSS)

**Frequência**: A cada 1 hora (agendado) + sob demanda

**Implementação**:
```python
# backend/app/services/rss_service.py

import feedparser
from datetime import datetime, timedelta

class RSSService:
    def fetch_feed(self, url: str, timeout: int = 30) -> list[dict]:
        """
        Fetch RSS feed com retry e timeout.
        
        Args:
            url: URL do feed RSS
            timeout: Timeout em segundos
            
        Returns:
            Lista de items parseados (titulo, link, descricao, pubDate, guid)
            
        Raises:
            TimeoutError: Se timeout excedido
            FeedParsingError: Se XML malformado
        """
        # Implementar com httpx + retry exponencial + circuit breaker
        pass
```

---

### 2. Parsing XML + Extração de Dados

**Campos Extraídos**:

| Campo RSS | Mapeamento | Tipo |
|-----------|-----------|------|
| `title` | `titulo_noticia` | string |
| `description` | `descricao_detalhada` | string (nullable) |
| `pubDate` | `data_ocorrencia` | datetime |
| `link` | `fonte_original` | string (URL) |
| `guid` | `id_externo_rss` | string (unique) |
| `category` | `tipo_crime_candidato` | string (opcional) |

**Exemplo**:
```python
item_raw = {
    "title": "Roubo em Taguatinga deixa dois feridos",
    "description": "Dois homens foram assaltados na QNL 02 de Taguatinga na noite de ontem. Sem vítimas graves.",
    "pubDate": "Fri, 06 Jun 2026 14:30:00 GMT",
    "link": "https://www.correiobraziliense.com.br/.../roubo-taguatinga",
    "guid": "roubo-taguatinga-12345"
}

# Após parsing:
item_parsed = {
    "titulo_noticia": "Roubo em Taguatinga deixa dois feridos",
    "descricao_detalhada": "Dois homens foram assaltados na QNL 02 de Taguatinga...",
    "data_ocorrencia": datetime(2026, 6, 6, 14, 30, 0),
    "fonte_original": "https://www.correiobraziliense.com.br/.../roubo-taguatinga",
    "id_externo_rss": "roubo-taguatinga-12345"
}
```

---

### 3. Extração de Localização (NLP/Regex)

**Objetivo**: Converter "Taguatinga" em (latitude, longitude, RA)

**Estratégia**: Dois passos

#### Passo 1: Identificar Regiões Administrativas (RA)

```python
# Mapeamento de nomes de RA para códigos + coordenadas
RA_MAPPING = {
    "Taguatinga": {"codigo": "RA-026", "lat": -15.7975, "long": -48.0473},
    "Ceilândia": {"codigo": "RA-009", "lat": -15.7942, "long": -48.2000},
    "Plano Piloto": {"codigo": "RA-001", "lat": -15.7902, "long": -47.8821},
    # ... mais 30+ regiões ...
}

def extrair_regiao(texto: str) -> Optional[dict]:
    """
    Busca nome de RA no texto da notícia.
    
    Estratégia:
    1. Regex case-insensitive por nomes de RA
    2. Se não encontrado, retorna None
    3. Se múltiplas regiões encontradas, usa a primeira
    """
    for ra_nome, ra_info in RA_MAPPING.items():
        if ra_nome.lower() in texto.lower():
            return ra_info
    return None
```

#### Passo 2: Geocodificação (se necessário)

Se o texto contiver endereço mas não RA:
```python
# Usar biblioteca geocodificadora (ex: geopy + Google Maps API)
# para converter "QNL 02, Taguatinga" → lat/long
# Fallback: usar centroide do DF se falhar
```

**Exemplo de Fluxo**:
```
"Roubo em Taguatinga deixa dois feridos"
    ↓
extrair_regiao(texto)
    ↓
RA_MAPPING["Taguatinga"]
    ↓
{
  "regiao_administrativa": "RA-026",
  "latitude": -15.7975,
  "longitude": -48.0473
}
```

---

### 4. Classificação de Tipo de Crime

**Estratégia**: Regex + keyword matching

```python
CRIME_TYPES = {
    "roubo": ["roubo", "assalto", "furto"],
    "homicídio": ["homicídio", "morte", "assassinato"],
    "agressão": ["agressão", "briga", "violência"],
    "tráfico": ["tráfico", "droga", "entorpecente"],
    "acidente": ["acidente", "colisão", "capotamento"],
    # ... mais tipos ...
}

def classificar_crime(titulo: str, descricao: str) -> str:
    """Detecta tipo de crime no texto."""
    texto = f"{titulo} {descricao}".lower()
    for crime_type, keywords in CRIME_TYPES.items():
        if any(kw in texto for kw in keywords):
            return crime_type
    return "outro"  # fallback
```

---

### 5. Validação (Pydantic)

```python
from pydantic import BaseModel, validator
from datetime import datetime

class NoticiaRSSSchema(BaseModel):
    titulo_noticia: str
    descricao_detalhada: Optional[str]
    data_ocorrencia: datetime
    fonte_original: str (URL válida)
    id_externo_rss: str (unique)
    tipo_crime: str (enum: roubo, homicídio, ...)
    regiao_administrativa: str (RA code: RA-001, RA-026, ...)
    latitude: float (range: -90 a 90)
    longitude: float (range: -180 a 180)
    
    @validator("data_ocorrencia")
    def data_nao_futura(cls, v):
        if v > datetime.now():
            raise ValueError("Data não pode ser no futuro")
        return v
    
    @validator("latitude", "longitude")
    def validar_coordenadas(cls, v):
        # Garantir precision de 6 decimais (~0.11m)
        return round(v, 6)
```

---

### 6. Transformação em ORM (SQLAlchemy)

```python
from sqlalchemy import Column, String, Float, DateTime, Integer, ForeignKey

class Ocorrencia(Base):
    __tablename__ = "ocorrencias_criminais"
    
    id = Column(Integer, primary_key=True)
    id_externo_rss = Column(String, unique=True, index=True)
    titulo_noticia = Column(String, index=True)
    descricao_detalhada = Column(String, nullable=True)
    tipo_crime = Column(String, index=True)
    data_ocorrencia = Column(DateTime, index=True)
    fonte_original = Column(String)
    
    locais_pin_id = Column(Integer, ForeignKey("locais_pin.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    regiao_administrativa = Column(String, index=True)
    
    resumo_gemini = Column(String, nullable=True)
    resumo_status = Column(String, default="PENDENTE")  # COMPLETO, PENDENTE, ERRO, FALLBACK
    
    criado_em = Column(DateTime, default=datetime.now)
    atualizado_em = Column(DateTime, default=datetime.now, onupdate=datetime.now)
```

---

### 7. Persistência Dupla

```python
# PostgreSQL (principal)
db.session.add(ocorrencia_orm)
db.session.commit()

# Redis/Cache (opcional, se ADR-003 = Redis obrigatório)
cache.set(f"ocorrencia:{ocorrencia_orm.id}", ocorrencia_orm.to_dict(), ttl=86400)  # 24h
```

---

## Tratamento de Erros

### Cenário 1: Feed Indisponível

```
Timeout/Connection Error
    ↓
Retry com backoff: 1s → 2s → 4s → 8s
    ↓
Após 5 tentativas: Circuit breaker abre
    ↓
Retorna últimas Ocorrências cacheadas (stale)
    ↓
Log warning + alertar equipe operacional
```

### Cenário 2: Item RSS Malformado

```
"title": null  ou pubDate em formato inválido
    ↓
Validação Pydantic falha
    ↓
Skip item + log debug
    ↓
Continuar processando próximos items
```

### Cenário 3: Localização não Encontrada

```
Texto não contém nome de RA
    ↓
Geocodificação opcional: Google Maps (se configurada)
    ↓
Se falhar: usar centroide do DF (-15.8, -48.0)
    ↓
Marcador no mapa aparece no centro; card avisa "localização aproximada"
```

---

## Agendamento: Scheduler (Celery/APScheduler)

```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

@scheduler.scheduled_job('interval', hours=1)
def atualizar_feed_rss():
    """Executa a cada 1 hora."""
    try:
        rss_service.fetch_and_process()
    except Exception as e:
        logger.error(f"Erro ao processar RSS: {e}")

scheduler.start()
```

---

## Deduplicação (id_externo_rss)

Para evitar notícias duplicadas:

```python
# Verificar se item já existe
existing = db.query(Ocorrencia).filter_by(
    id_externo_rss=item_parsed["id_externo_rss"]
).first()

if existing:
    # Item já processado; skip
    logger.debug(f"Item {item_parsed['id_externo_rss']} já existe")
else:
    # Novo item; processar
    ocorrencia = Ocorrencia(**item_parsed)
    db.session.add(ocorrencia)
```

---

## Performance & Otimizações

| Aspecto | Otimização |
|---------|-----------|
| **Parser XML** | Usar `feedparser` (otimizado) vs xml.etree (lento) |
| **Extração RA** | Cache de RA_MAPPING em memória; não recarregar a cada item |
| **Gemini Async** | Processar resumos em background job (não bloquear feed) |
| **Índices DB** | `(id_externo_rss, data_ocorrencia)` compound index |
| **TTL Cache** | 24h para evitar re-parsing de feed |

---

## Testes

### Fixture: Sample RSS Feed

```python
# tests/fixtures/sample_rss.xml
<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Roubo em Taguatinga</title>
      <description>Assalto na QNL 02...</description>
      <pubDate>Fri, 06 Jun 2026 14:30:00 GMT</pubDate>
      <link>https://correiobraziliense.com.br/roubo-taguatinga</link>
      <guid>roubo-taguatinga-12345</guid>
    </item>
  </channel>
</rss>
```

### Casos de Teste

```python
# tests/test_rss_service.py

def test_parse_feed_valido():
    """Parser extrai campos corretamente."""
    items = rss_service.fetch_feed(SAMPLE_RSS)
    assert len(items) > 0
    assert items[0]["titulo_noticia"] == "Roubo em Taguatinga"

def test_extracao_regiao():
    """Extração de RA funciona."""
    regiao = extracao.extrair_regiao("Roubo em Taguatinga")
    assert regiao["codigo"] == "RA-026"
    assert regiao["lat"] == -15.7975

def test_classificacao_crime():
    """Classificação de tipo de crime funciona."""
    tipo = classificacao.classificar_crime("Homicídio em Ceilândia", "...")
    assert tipo == "homicídio"

def test_deduplicacao():
    """Itens duplicados são skipados."""
    rss_service.process_item(item1)
    rss_service.process_item(item1)  # Mesmo item
    assert db.query(Ocorrencia).count() == 1

def test_resilience_timeout():
    """Feed timeout → retry → circuit breaker."""
    # Mock timeout; verificar retry
    # Mock 5 falhas; verificar circuit breaker abre
```

---

## Referências

- [CONTEXT.md - Rate Limiting & Resilience](./CONTEXT.md#rate-limiting--resilience)
- [definir-fluxo-de-dados.md - Estratégia de Extração](./definir-fluxo-de-dados.md#estratégia-de-extração-pull-periódico--cache)
- [API-Contract.md - Ocorrência](./API-Contract.md#1-modelo-de-dados-ocorrência)
- [IMPLEMENTATION-CHECKLIST.md - RSS Parser Tasks](./IMPLEMENTATION-CHECKLIST.md#serviçoingestão)
