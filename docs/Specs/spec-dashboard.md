# Especificação Técnica e Funcional: Dashboard de Produtividade e Governança

## 1. Introdução e Contexto
No desenvolvimento de software sob metodologias ágeis, especialmente no ecossistema acadêmico da disciplina de Métodos de Desenvolvimento de Software (MDS) na Universidade de Brasília (UnB - FGA), a transparência e a análise de dados são fundamentais para a governança do projeto. 

Esta especificação documenta o **Dashboard de Produtividade** do projeto **SafeStreets**. A ferramenta foi concebida para extrair, processar e visualizar dados operacionais diretamente do repositório do GitHub, transformando métricas brutas em indicadores visuais claros sobre a evolução do escopo, distribuição de esforço e engajamento do squad.

---

## 2. Atribuição de Papéis e Alinhamento
O desenvolvimento e a viabilização técnica deste painel foram conduzidos sob a seguinte estrutura de governança:
* **Concepção Geral e Liderança de Implementação:** Matheus Queiroz (Project Owner / Engenheiro de Software). Responsável pela arquitetura do script de coleta em Python, resolução de gargalos críticos de infraestrutura (CI/CD, limites de API, conflitos de concorrência) e codificação das visualizações dinâmicas em D3.js.
* **Ideação de Funcionalidade Específica:** Edson Gabriel. Contribuiu com a proposta estratégica de implementação do gráfico de distribuição por categorias (rosca/pizza).
* **Alinhamento Institucional:** Todo o grupo de desenvolvimento do SafeStreets foi consultado, estando ciente e em conformidade com as métricas coletadas, regras de contagem e exibição dos rankings.

---

## 3. Arquitetura de Dados e Componentes Técnicos
A arquitetura do subsistema de métricas adota uma abordagem descentralizada e estática (Jamstack), eliminando a necessidade de um banco de dados persistente ou servidor ativo de backend rodando 24/7. O fluxo de dados divide-se em três camadas principais:

### 3.1. Coletor de Dados Automatizado (`collect_metrics.py`)
Componente em Python encarregado de se comunicar com a API REST do GitHub v3. 
* **Tecnologias:** Python 3.11, `PyGithub`, `requests`.
* **Otimização de Limites (API Rate Limiting):** Inicialmente, requisições aninhadas causavam estouro do limite de requisições por hora imposto pelo GitHub (Rate Limit). O script foi refatorado para ler as propriedades locais das labels diretamente do payload principal de *Issues* e *Pull Requests*, minimizando drasticamente as chamadas de rede de formato exaustivo.
* **Saída:** Um arquivo estruturado em JSON (`docs/productivity/metrics.json`) que atua como o repositório estático de dados do painel.

### 3.2. Pipeline de Integração Contínua (`.github/workflows/metrics.yml`)
Automação em nuvem via GitHub Actions que garante a atualização contínua e autônoma do painel.
* **Gatilhamento (Triggers):** * Execução diária programada (`schedule` via `cron: '0 0 * * *'`).
  * Disparo automático em qualquer novo código integrado à ramificação principal (`push` na `main`).
  * Execução manual sob demanda através da interface web (`workflow_dispatch`).
* **Segurança e Escrita:** O ambiente injeta de forma segura o `secrets.GITHUB_TOKEN` com permissões explícitas de escrita (`contents: write`), permitindo que o robô faça o commit e o push do arquivo `metrics.json` atualizado de volta para o repositório sem intervenção humana.

---

## 4. Visualizações de Interface (Frontend D3.js)
O frontend foi desenvolvido utilizando HTML5, CSS3 integrado ao layout existente do projeto e a biblioteca de manipulação de documentos baseada em dados **D3.js** para renderização de gráficos vetoriais (SVG) altamente performáticos e interativos.

### 4.1. Gráfico 1: Evolução de Issues (Por Sprint)
Substitui a visualização cronológica genérica por marcações explícitas de ciclos ágeis de desenvolvimento (Sprints).
* **Métrica:** Volume de Issues Abertas acumuladas vs. Issues Fechadas (Resolvidas).
* **Comportamento Observado (Sprint 7):** Os dados históricos revelam estabilidade controlada entre as Sprints 0 e 6 (média de 4 a 6 issues por ciclo). A **Sprint 7** apresenta uma curva exponencial ascendente acentuada, totalizando **13 issues fechadas**. Esse fenômeno é característico de fases de encerramento de marcos (*Milestones*), demonstrando o aumento substancial da velocidade de entrega do time para amarração de escopo, refatoração e documentação.

### 4.2. Gráfico 2: Distribuição de Esforço por Issue (Top 5 Labels)
Visualização em formato de Rosca (Donut Chart) proposta para auditar a categorização de tarefas e identificar o foco de investimento de energia do squad.
* **Regra de Negócio:** Agrupa as labels mais frequentes do repositório no "Top 5" e move o restante para uma categoria consolidada denominada "Outros", preservando a legibilidade e a semântica visual.
* **Distribuição Percentual de Escopo:**
  * **`MDS` (38.1%):** Label mãe que assegura o rastreamento integral das metas acadêmicas básicas.
  * **`documentation` (23.8%):** Indica robustez na governança. Cerca de um quarto de todo o esforço do projeto foi dedicado à formalização de manuais, guias de arquitetura, templates e atas.
  * **`bug` (19%):** Demonstra maturidade em testes e qualidade de software, evidenciando ciclos ativos de varredura e correção de defeitos em ambiente local e homologação.
  * **`management` (14.3%):** Reflete a carga operacional de coordenação, planejamento de sprints e refinamento de backlog pelo Product Owner.
  * **`Outros` (4.8%):** Margem residual que comprova a excelente aderência do time ao padrão estrito de etiquetagem de tarefas.

### 4.3. Rankings Coletivos Ajustados
Abaixo dos gráficos, o painel exibe tabelas dinâmicas com os rankings de engajamento do time (Commits efetuados, PRs abertos e Issues solucionadas). 
* **Ajuste de Escala:** Configurado cirurgicamente para listar o **Top 6 colaboradores ativos**, garantindo uma exibição simétrica e livre de quebras estéticas na interface para todos os membros centrais do desenvolvimento.

---

## 5. Manutenção e Extensibilidade
Para adicionar novas labels ao gráfico de distribuição ou alterar o mapeamento temporal das Sprints futuras, os desenvolvedores devem atualizar a matriz de mapeamento de datas contida no cabeçalho do arquivo `collect_metrics.py`. O frontend lerá automaticamente as novas chaves injetadas no JSON, mantendo a característica de acoplamento fraco e alta coesão do sistema.
