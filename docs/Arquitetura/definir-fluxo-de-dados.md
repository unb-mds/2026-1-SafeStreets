# Fluxo de Dados: SafeStreets (Ingestão e Processamento)

Conforme definido na decisão de arquitetura, o sistema adota um pipeline estruturado de **ETL (Extração, Tratamento e Transformação)** focado especificamente em dados de segurança pública, acoplado a uma IA dedicada exclusivamente à sumarização dos relatos.

---

# Pipeline de Entrada (Backend e Ingestão)

O **FastAPI** gerencia o ciclo de vida da ingestão de dados de forma assíncrona, garantindo que a comunicação com serviços externos não bloqueie a experiência do usuário ao navegar pelo mapa de criminalidade.

```plaintext
[API Aberta - RSS Portais de Nóticias]
           │
           ▼ (HTTPX / Requests Assíncronos por Lat/Long)
[Camada de Ingestão (Python)] ──► Validação Inicial (Pydantic)
           │
           ▼
[Pipeline de Processamento (ETL)] ──► Enriquecimento (Busca do histórico/relato completo do crime)
           │
           ▼
[Módulo de Inteligência Artificial] ──► Gemini (Geração de Resumos Concisos)
           │
           ▼
[Camada de Persistência] ──► Banco de Dados Relacional (PostgreSQL com histórico cacheado)
```
## **Passo a Passo do Fluxo de Ingestão** 

## **1. Extração Georreferenciada** 

A partir das coordenadas clicadas no mapa, o backend realiza uma chamada assíncrona para a API do governo do DF, filtrando ocorrências criminais registradas naquela região. 

## **2. Enriquecimento** 

Para cada crime retornado (muitas vezes com descrições longas ou jargões policiais), o sistema busca o conteúdo textual completo do boletim ou relato associado. 

## **3. Tratamento e Validação (Pydantic)** 

O JSON bruto é parseado e limpo. O Pydantic garante a tipagem forte, padronizando formatos de datas das ocorrências e lidando com campos nulos. 

## **4. Processamento por IA** 

O texto validado é enviado via API para o Google Gemini. O modelo executa uma única ação: condensar o relato do crime em um resumo ágil e direto, facilitando a leitura rápida pelo usuário final. 

## **5. Persistência Dupla (Cache)** 

A ocorrência, agora com seu resumo gerado pela IA e suas coordenadas exatas, é salva no PostgreSQL. Isso evita chamadas redundantes à API de segurança e ao Gemini caso outro usuário clique na mesma área. 

## **Pipeline de Saída (Do Banco à Tela do Usuário)** 

O consumo de dados é otimizado para que a interface cartográfica responda de forma fluida e instantânea aos cliques do usuário, focando na exibição clara dos incidentes. 

|**Etapa**|**Responsável**|**Descrição Técnica**||
|---|---|---|---|
|1. Disparo|Frontend (Next.js / Leaflet)|O usuário clica em um ponto do mapa interativo. O Next.js captura Latitude/Longitude e dispara um GET tipado em TypeScript.||
|2. Recepção|Backend (FastAPI)|O backend recebe a requisição. O Pydantic valida o formato numérico das coordenadas.||
|3. Consulta|Banco (PostgreSQL)|O backend verifica se há dados de crimes cacheados para aquele raio espacial.||
|4. Resposta|Backend (FastAPI)|O FastAPI consolida os crimes da região em um OcorrenciasLocalResponse.||
|5. Exibição|Frontend (Next.js)|O Next.js recebe o JSON e o Leaflet renderiza um PIN interativo no mapa.||



## **Estrutura de Dados Espaciais e Conteúdo (Modelo Relacional)** 

O sistema adota um modelo relacional simplificado no PostgreSQL, focado na ligação direta entre coordenadas geográficas e ocorrências criminais resumidas, eliminando a necessidade de tabelas complexas de categorização por IA. 

## **Modelagem de Dados no Backend (FastAPI + Pydantic/ORM)** 

As relações são mapeadas conectando os locais físicos diretamente às ocorrências criminais já processadas. 

```plaintext
[locais_pin] 1 ──── 0..* [ocorrencias_criminais]
      │                                                   
      │ 1                                               
      └──────── 0..* [historico_consultas]
```

## **Detalhes das Interações de Fluxo** 

## **Associação Crime-Local** 

O FastAPI garante que toda nova ocorrência criminal obtida da API externa seja vinculada ao id da tabela locais_pin. Um mesmo local perigoso pode concentrar múltiplos registros de crimes ao longo do tempo. 

## **Geração de Cache Espacial** 

A tabela historico_consultas registra os timestamps da última atualização daquele raio geográfico. O FastAPI utiliza essas informações para decidir se busca os dados diretamente no banco ou realiza um novo fetch na API governamental. 

## **Benefícios Arquiteturais da Stack Selecionada** 

## **Casamento de Tipos (Pydantic** → **TypeScript)** 

A definição do retorno das ocorrências no FastAPI garante um contrato OpenAPI previsível. O frontend em Next.js gera interfaces TypeScript automaticamente, reduzindo bugs de integração. 

## **Otimização Extrema de Custos** 

Ao delegar ao Gemini apenas a função de resumo, o sistema reduz drasticamente o tamanho dos prompts e o consumo de tokens. O PostgreSQL atua como camada de cache para evitar reprocessamentos. 

## **Confiabilidade e Testabilidade Rigorosa** 

A arquitetura modular do FastAPI facilita testes automatizados utilizando Pytest, garantindo validação contínua dos endpoints e funcionamento correto da rota /health. 

