# Estudo: RSS de Notícias

## O que é

RSS é a sigla para **Really Simple Syndication** — em português, Sindicalização Realmente Simples. É um formato padrão baseado em XML criado para distribuir conteúdo da web de forma estruturada e automática.

Na prática, o RSS funciona como um canal de distribuição que sites e portais de notícias mantêm atualizado automaticamente. Cada vez que uma nova publicação é feita, ela é adicionada a um arquivo RSS acessível por uma URL fixa. Qualquer sistema que conheça essa URL pode ler as publicações mais recentes sem precisar acessar o site manualmente.

O formato foi criado no final dos anos 1990 e se tornou um padrão amplamente adotado por portais de notícias, blogs, podcasts e outros tipos de conteúdo digital. Hoje, a maioria dos grandes veículos de comunicação ainda mantém feeds RSS ativos, mesmo que pouco divulgados.

---

## Como funciona

Um feed RSS é um arquivo XML hospedado em uma URL fixa pelo próprio site. Esse arquivo é atualizado automaticamente pelo sistema do veículo a cada nova publicação. Qualquer programa ou serviço que acesse essa URL recebe os dados das publicações mais recentes em formato estruturado — sem anúncios, sem menus, sem elementos visuais da página. Apenas o conteúdo.

A estrutura de um feed RSS é composta por um canal (`channel`) que contém uma lista de itens (`item`). Cada item representa uma publicação e carrega informações como título, resumo, link para a matéria completa e data de publicação.

Exemplo real de como um item RSS se parece:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Segurança DF — Metrópoles</title>
    <link>https://www.metropoles.com/distrito-federal/seguranca-df</link>
    <description>Notícias de segurança pública no Distrito Federal</description>

    <item>
      <title>Homem é preso após roubo a mão armada em Taguatinga</title>
      <description>
        A PMDF deteve o suspeito na QNL 8 após denúncia de moradores da região.
        Ele foi encaminhado à delegacia e autuado em flagrante.
      </description>
      <link>https://www.metropoles.com/noticia/homem-preso-roubo-taguatinga</link>
      <pubDate>Fri, 22 May 2026 14:30:00 GMT</pubDate>
    </item>

  </channel>
</rss>
```

---

## Por que o RSS é útil para sistemas

Do ponto de vista de um desenvolvedor, o RSS resolve um problema prático: como coletar dados de um site externo sem precisar fazer scraping — ou seja, sem precisar interpretar o HTML da página, que muda frequentemente e quebra automações.

O RSS oferece:

- **Estrutura previsível** — os dados sempre chegam no mesmo formato, com os mesmos campos
- **Atualização automática** — o feed é atualizado pelo próprio site sempre que há nova publicação
- **Acesso gratuito e público** — não exige autenticação nem cadastro na maioria dos casos
- **Leveza** — o arquivo XML é pequeno e rápido de baixar, mesmo em grande volume

Isso faz do RSS uma fonte de dados confiável para sistemas que precisam monitorar publicações de forma contínua e automatizada.

---

## Como consumir RSS em Python

A biblioteca `feedparser` é o padrão para leitura de feeds RSS em Python. Ela interpreta o XML automaticamente e entrega os dados como dicionários Python, sem necessidade de parsing manual.

Instalação:

```bash
pip install feedparser
```

Leitura básica de um feed:

```python
import feedparser

feed = feedparser.parse("https://www.metropoles.com/distrito-federal/seguranca-df/feed")

print(f"Canal: {feed.feed.title}")
print(f"Total de itens: {len(feed.entries)}\n")

for item in feed.entries:
    print(f"Título: {item.title}")
    print(f"Resumo: {item.summary}")
    print(f"Link: {item.link}")
    print(f"Data: {item.published}")
    print("---")
```

Saída esperada:

```
Canal: Segurança DF — Metrópoles
Total de itens: 20

Título: Homem é preso após roubo a mão armada em Taguatinga
Resumo: A PMDF deteve o suspeito na QNL 8 após denúncia de moradores...
Link: https://www.metropoles.com/noticia/...
Data: Fri, 22 May 2026 14:30:00 GMT
---
```

---

## O que o RSS entrega e o que não entrega

É importante entender os limites do que um feed RSS fornece para não criar expectativas erradas sobre os dados disponíveis.

**O que o RSS entrega:**

- Título da notícia
- Resumo ou trecho inicial do texto
- Link para a matéria completa no site
- Data e hora de publicação
- Autor (quando o veículo inclui essa informação)
- Categoria ou tags (em alguns feeds)

**O que o RSS não entrega:**

- O corpo completo da matéria — apenas o resumo
- Localização geográfica estruturada — a localidade, quando presente, está escrita dentro do texto em linguagem natural
- Imagens ou mídias — apenas referências a elas, quando o feed as inclui
- Dados em tempo real — o feed é atualizado periodicamente, não instantaneamente

---

## RSS versus scraping

Uma dúvida comum é: por que usar RSS em vez de fazer scraping direto no site para obter mais informações, como o texto completo da matéria?

| | RSS | Scraping |
|---|---|---|
| Legalidade | Público e permitido | Depende dos termos de uso do site |
| Estabilidade | Formato fixo e previsível | Quebra quando o layout do site muda |
| Manutenção | Nenhuma | Requer atualização constante |
| Conteúdo disponível | Título, resumo e metadados | Potencialmente o conteúdo completo |
| Bloqueio | Não ocorre | Sites podem bloquear IPs de scrapers |

Para a maioria dos casos de uso que envolvem monitoramento de notícias, o RSS é a escolha mais estável, segura e sustentável a longo prazo.

---

## Coleta periódica automatizada

Um feed RSS não envia notificações — é preciso consultá-lo ativamente em intervalos regulares para verificar se há novos itens. Esse processo é chamado de **polling**.

Em aplicações Python com FastAPI, a coleta periódica pode ser implementada com a biblioteca `APScheduler`, que permite agendar a execução de funções em intervalos definidos sem depender de serviços externos:

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import feedparser

scheduler = AsyncIOScheduler()

async def coletar_feeds():
    feeds = [
        "https://www.metropoles.com/distrito-federal/seguranca-df/feed",
        "https://www.correiobraziliense.com.br/cidades-df/feed",
    ]
    for url in feeds:
        feed = feedparser.parse(url)
        for item in feed.entries:
            # processar cada item
            print(item.title)

scheduler.add_job(coletar_feeds, "interval", hours=1)
scheduler.start()
```

Com isso, a coleta acontece automaticamente a cada hora, sem intervenção manual.
