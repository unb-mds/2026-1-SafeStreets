## Issue: [Estudo] Agentes de IA e Extração de Dados Não Estruturados

Descrição:
Este estudo documenta a pesquisa sobre a implementação de Agentes de IA para o projeto SafeStreets. O foco principal foi entender como transformar o texto bruto de notícias de crimes no DF (dados não estruturados) em objetos JSON (dados estruturados) para alimentar nosso mapa de risco.
### 1. O que são Agentes de IA?

Diferente de uma simples chamada de API de chat, um Agente de IA funciona como um "sistema de raciocínio". Ele utiliza um LLM (Large Language Model) como motor central para:

    Interpretação de Contexto: Ler a notícia e discernir se o fato é um crime ou apenas uma notícia geral.

    Extração de Entidades: Identificar o tipo de crime, o local (Região Administrativa) e a data/hora.

    Tomada de Decisão: Decidir se a informação é confiável ou se deve ser descartada por falta de dados geográficos.

### 2. Arquitetura do Agente no SafeStreets

Para o nosso projeto, estudei a estrutura de um agente focado em extração, composta por:

    Planejamento (Planning): O uso de System Prompts para definir as Regiões Administrativas (RAs) válidas do DF, evitando que a IA alucine com cidades de Goiás.

    Memória: Necessária para que o agente não processe a mesma notícia duas vezes.

    Uso de Ferramentas (Tool Use): Conectar a IA ao nosso Web Scraper (BeautifulSoup/Requests) para que ela receba o input limpo.

### 3. O Dilema: Escolha da IA e Provedor

Durante o estudo, testei as duas principais frentes do mercado, e a decisão final do Squad deve considerar:

    OpenAI (GPT-4o-mini): Excelente consistência em JSON, mas exige gerenciamento de créditos de API.

    Google (Gemini 2.0/3.0): Vantajoso pela janela de contexto e pelo acesso de estudante que possuímos, embora exija atenção à gestão de quota (erros de Rate Limiting 429 encontrados em testes iniciais).

    Local (Ollama/Llama 3): Opção gratuita para rodar localmente, mas exige hardware potente e complica o deploy no GitHub Actions.

### 4. Desafios Técnicos Encontrados

Nesta fase de estudo, identifiquei gargalos importantes:

    Output Estrito: A necessidade de usar bibliotecas como Pydantic para forçar a IA a responder apenas em JSON, caso contrário, o backend do portal irá quebrar.

    Incompatibilidade de Versões: Notei que o uso de versões muito recentes do Python (como a 3.14) gera conflitos com algumas bibliotecas de IA (Pydantic V1/V2), sendo recomendada a padronização do ambiente via Docker.

### Bibliografia e Referências

    LangChain Documentation: Introduction to Autonomous Agents - https://python.langchain.com/docs/concepts/agents/

    OpenAI Cookbook: Techniques for data extraction - https://cookbook.openai.com/examples/entity_extraction_for_long_documents

    Google AI for Developers: Gemini API Quickstart - https://ai.google.dev/gemini-api/docs/quickstart

    DeepLearning.AI: AI Agents and Agentic Workflows - https://www.deeplearning.ai/the-batch/how-agents-can-improve-llm-performance/

    CrewAI Framework: Multi-agent systems orchestration - https://docs.crewai.com/core-concepts/Agents/
