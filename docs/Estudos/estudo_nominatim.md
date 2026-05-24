# O que é o Nominatim?

Nominatim é uma ferramenta para buscar dados do OpenStreetMap (OSM) por nome e endereço — o chamado geocoding — e também para gerar endereços sintéticos a partir de pontos OSM, o que é conhecido como reverse geocoding.

O Nominatim é o software de geocodificação que alimenta o site oficial do OSM em openstreetmap.org, chegando a responder 30 milhões de consultas por dia em um único servidor. A versão mais recente é a **5.3.2**.

---

## Arquitetura

A arquitetura do Nominatim é dividida em três partes fundamentais: a importação de dados, o cálculo de endereços e o frontend de busca. O estágio de importação lê os dados brutos do OSM e extrai todas as informações úteis para a geocodificação, tarefa realizada pelo `osm2pgsql`. O frontend recebe as consultas de busca e geocodificação reversa, consulta os dados e retorna os resultados no formato solicitado — esse componente está no pacote `nominatim-api`.

O sistema é construído em torno de uma classe de API central que gerencia conexões com o banco de dados, coordena o subsistema de busca e gerencia a formatação dos resultados. Ele suporta operações síncronas e assíncronas para acomodar diferentes cenários de implantação.

---

## Endpoints da API

O Nominatim indexa recursos nomeados (ou numerados) do dataset OSM, além de um subconjunto de recursos não nomeados como pubs, hotéis e igrejas. Sua API oferece os seguintes endpoints principais:

| Endpoint | Descrição |
|----------|-----------|
| `/search` | Geocodificação direta (nome/endereço → coordenadas) |
| `/reverse` | Geocodificação reversa (coordenadas → endereço) |
| `/lookup` | Consulta por OSM ID específico |
| `/details` | Detalhes internos de um objeto (apenas para depuração) |
| `/status` | Verificação do estado do serviço |

A API suporta consultas estruturadas, onde o endereço já está dividido em componentes, e cada parâmetro representa um campo do endereço. Os resultados podem ser retornados em **JSON**, **XML** e **GeoJSON**.

---

## Geocodificação Reversa

O Nominatim pode encontrar e retornar endereços correspondentes a uma dada coordenada de latitude e longitude. Para isso, usa-se o endpoint `/reverse` com os parâmetros `lat` e `lon`. O endpoint suporta o parâmetro `zoom`, que retorna resultados de granularidade diferente dependendo do valor — por exemplo, país, cidade ou rua.

---

## Política de Uso

O serviço público em `nominatim.openstreetmap.org` existe principalmente para alimentar a barra de busca do openstreetmap.org. A política exige:

- No máximo **1 requisição por segundo**
- Identificação da aplicação via `HTTP Referer` ou `User-Agent`
- Exibição clara de atribuição de dados
- Proibição de buscas sistemáticas em lote (como grids de geocodificação reversa ou download de listas completas de CEPs)

---

## Instalação Própria (Self-Hosting)

É possível configurar sua própria instância offline do Nominatim, o que permite realizar tantas geocodificações quanto necessário, sem restrições de uso. Isso é especialmente útil para aplicações que precisam de alto volume de requisições, como:

- Rastreamento de frotas
- Aplicações de logística
- Qualquer serviço onde o uso da API pública seria inadequado

---

## Casos de Uso Práticos

| Caso | Endpoint | Exemplo |
|------|----------|---------|
| Busca por endereço | `/search` | `"Palmas, Tocantins, Brasil"` |
| Geolocalização por GPS | `/reverse` | `lat=-10.18, lon=-48.33` |
| Integrar num site | `/search` | Com `format=json` |
| Verificar um POI | `/lookup` | `?osm_ids=N123456` |

---

## Resumo

O Nominatim é uma solução robusta, open source e gratuita para geocodificação baseada no OpenStreetMap. É a escolha ideal para quem precisa de geocodificação sem depender de APIs pagas como Google Maps ou Mapbox, especialmente em instâncias auto-hospedadas para uso intensivo.
