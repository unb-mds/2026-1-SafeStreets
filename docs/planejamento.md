# 📅 Planejamento e Gestão do Projeto

Bem-vindo à seção de **Planejamento e Gestão** do projeto **SafeStreets**. Aqui está documentada toda a nossa abordagem metodológica, estruturação de entregas, mapeamento de atividades (Story Map) e o histórico de evolução ao longo de cada Sprint.

---

## 🚀 Metodologia de Trabalho

O SafeStreets utiliza metodologias ágeis como base para sua organização. Adotamos práticas adaptadas do **Scrum** e **Kanban** para garantir transparência, inspeção e adaptação contínua ao longo do desenvolvimento:

*   **Ciclo Incremental:** O projeto é estruturado em **Sprints** periódicas com entregas de valor contínuas.
*   **Kanban Organizacional:** Gestão e distribuição de tarefas transparente no GitHub Projects.
*   **Melhoria Contínua:** Reuniões regulares de alinhamento e retrospectiva ao final de cada Sprint.

> **Nota:** Para entender mais sobre a fundamentação e a modelagem do ciclo de vida que embasa nossa estratégia de gestão, acesse o documento completo de [Ciclo de Vida do Software](Milestone/Sprint-1/ciclo-vida-software.md) elaborado na Sprint 1.

---

## 🗺️ Story Map & Backlog de Atividades

O **Story Map** é o núcleo estrutural do nosso planejamento, organizando a jornada dos usuários e as tarefas do time em quatro grandes pilares (**Épicos**). Ele permite que a equipe visualize o produto como um todo e planeje entregas incrementais baseadas em valor real.

> 🎨 **Acesso Rápido ao Design:** Interaja diretamente com as telas funcionais do [Protótipo de Alta Fidelidade no Figma](https://www.figma.com/design/ELsAXrAg9XaFQ8MODp3tdA/Prot%C3%B3tipo-de-alta-fidelidade-SafeStreets?node-id=0-1&t=EaSexgw80dwrrPx8-1). <sub style="opacity: 0.85;">A modelagem ágil complementar de jornadas está mapeada no _[Story Map no Figma](https://www.figma.com/board/13SnyvGleeaYsubnOhMeYk/Template-MDS-Squad-1?node-id=0-1&t=22K194iRB48CIkId-1)_ (link complementar).</sub>

---

### 📊 Matriz do Story Map por Releases

A matriz abaixo ilustra a divisão do nosso backlog de User Stories (Histórias de Usuário) entre as duas principais entregas planejadas do projeto, organizadas horizontalmente pela jornada do usuário (Épicos):

| Release | Épico 1: Feed de Notícias | Épico 2: Mapa Interativo (Core) | Épico 3: Dashboard & Analytics | Épico 4: Backend & APIs |
| :--- | :--- | :--- | :--- | :--- |
| **Release 1: MDS MVP (v0.1.0)** | **US01:** Feed de Notícias Recentes<br>**US02:** Detalhar Notícia e Fonte | **US03:** Renderizar Mapa Interativo<br>**US04:** Detalhar Alerta no Modal | **US05:** Menu de Navegação Lateral | **US06:** Raspagem de Dados Assíncrona<br>**US07:** Endpoints JSON Principais |
| **Release 2: Refinamento (v1.0.0)** | **US08:** Busca Textual no Feed | **US09:** Filtros de Categoria e Período<br>**US10:** Limpeza Rápida de Filtros<br>**US11:** Alerta de "Sem Ocorrências" | **US12:** Dashboard de Produtividade (commits, PRs) | **US13:** IA para Classificação de Ocorrências<br>**US14:** Cache e Rate Limiting da API |

---

### 🔍 Detalhamento Profundo dos Épicos de Desenvolvimento

Abaixo, detalhamos cada Épico de desenvolvimento, mapeando as personas, a jornada passo a passo, as user stories com seus respectivos critérios de aceite e o valor de negócio gerado.

#### 📝 Épico 1: Feed de Notícias (Informação do Cidadão)
*   **Persona Principal:** **Mariana**, cidadã preocupada com a segurança do seu trajeto diário que busca informações rápidas, confiáveis e consolidadas sobre incidentes urbanos.
*   **Jornada do Usuário (User Steps):**
    1.  Acessa o SafeStreets e vê o feed de notícias na tela inicial.
    2.  Navega cronologicamente pelas notícias publicadas.
    3.  Digita palavras-chave no campo de busca para encontrar eventos específicos (ex: "assalto", "iluminação").
    4.  Clica em uma notícia para abrir o detalhamento e conferir a fonte e a data.
*   **Histórias de Usuário & Critérios de Aceite:**
    *   **US01 (RF01) — Exibição de Feed de Notícias (Release 1):** Como Mariana, quero visualizar um feed de notícias de segurança na tela inicial para me manter atualizada sobre incidentes recentes na minha cidade.
        *   *Critério de Aceite 1:* As notícias devem ser ordenadas por data de publicação (mais recentes primeiro).
        *   *Critério de Aceite 2:* Cada card de notícia deve exibir título, data de publicação, descrição resumida e categoria do incidente.
    *   **US02 (RF02) — Detalhamento e Validação (Release 1):** Como Mariana, quero clicar em um card do feed para ver a notícia completa e o link da fonte original para validar a veracidade da informação.
        *   *Critério de Aceite 1:* A abertura dos detalhes deve exibir o texto completo sem desconfigurar a interface do site.
        *   *Critério de Aceite 2:* O link para a fonte original da notícia deve abrir em uma nova aba (`target="_blank"`).
    *   **US08 (RF03) — Busca Textual no Feed (Release 2):** Como Mariana, quero buscar notícias por palavras-chave para filtrar ocorrências de meu interesse imediato.
        *   *Critério de Aceite 1:* A filtragem deve ocorrer instantaneamente ao digitar ou ao clicar no botão de busca.
        *   *Critério de Aceite 2:* O sistema deve suportar termos em minúsculo/maiúsculo e retornar feedbacks claros em caso de nenhuma correspondência.
*   **Valor Estratégico:** Facilita o acesso à informação pública de segurança de forma agregada, aumentando a consciência situacional da população local.

#### 🗺️ Épico 2: Mapa Interativo (Visualização Geográfica de Riscos)
*   **Persona Principal:** **Felipe**, estudante universitário que realiza trajetos noturnos e utiliza o mapa espacial para evitar zonas com alto índice de ocorrências ou falta de iluminação.
*   **Jornada do Usuário (User Steps):**
    1.  Acessa a aba "Mapa" através da navegação principal.
    2.  Visualiza marcadores (pins) distribuídos geograficamente na cidade.
    3.  Utiliza filtros no menu lateral para selecionar apenas categorias de infraestrutura (ex: lâmpadas queimadas) ou tipo de crime.
    4.  Aplica filtros de intervalo de datas para ver ocorrências recentes.
    5.  Clica em um pin para visualizar o detalhamento no modal (ID, descrição, data).
    6.  Limpa os filtros para retornar à visualização padrão.
*   **Histórias de Usuário & Critérios de Aceite:**
    *   **US03 (RF04) — Renderização Espacial (Release 1):** Como Felipe, quero visualizar marcadores geográficos no mapa interativo para identificar visualmente pontos de risco no meu trajeto.
        *   *Critério de Aceite 1:* O mapa deve centralizar automaticamente na região metropolitana de interesse ao carregar.
        *   *Critério de Aceite 2:* Os pins devem usar cores ou ícones diferenciados baseados na categoria do alerta.
    *   **US04 (RF07) — Visualização de Detalhes (Release 1):** Como Felipe, quero interagir com um pin para visualizar um modal contendo detalhes estruturados da ocorrência.
        *   *Critério de Aceite 1:* O modal deve abrir com efeito suave de transição e conter o ID (padrão RA-XXXXX), descrição, data e localização exata.
        *   *Critério de Aceite 2:* O modal deve possuir um botão de fechamento acessível e intuitivo.
    *   **US09 (RF05) — Filtros Avançados (Release 2):** Como Felipe, quero aplicar filtros por categoria (ex: assalto, via pública) e período temporal para analisar incidentes sob recortes específicos.
        *   *Critério de Aceite 1:* A filtragem do mapa deve ocorrer de forma assíncrona, atualizando a exibição sem recarregar a página inteira.
        *   *Critério de Aceite 2:* Os filtros de datas devem permitir intervalos rápidos como "últimos 7 dias" ou "mês atual".
    *   **US10 & US11 (RF06, RF08) — Controle de Visualização (Release 2):** Como Felipe, quero limpar os filtros rapidamente com um clique e receber feedbacks caso a busca não retorne marcadores.
        *   *Critério de Aceite 1:* O botão "Limpar filtros" deve resetar todos os inputs e reexibir todos os pins originais instantaneamente.
        *   *Critério de Aceite 2:* Se nenhum pin corresponder ao filtro, deve exibir um toast ou mensagem flutuante amigável indicando *"Nenhum resultado encontrado"*.
*   **Valor Estratégico:** Fornece o núcleo visual e interativo da plataforma (core product), transformando dados textuais em inteligência espacial imediata para prevenção de riscos urbanos.

#### 📊 Épico 3: Dashboard & Analytics (Transparência de Métricas)
*   **Persona Principal:** **Dra. Roberta**, pesquisadora em segurança pública e gestora do projeto que deseja avaliar estatísticas consolidadas e monitorar o ritmo operacional do time de desenvolvimento.
*   **Jornada do Usuário (User Steps):**
    1.  Acessa a Homepage e rola até a seção de métricas.
    2.  Interage com os gráficos dinâmicos de commits e PRs do GitHub.
    3.  Analisa a distribuição de trabalho por desenvolvedor.
    4.  Observa as faixas horárias de maior produtividade da equipe.
*   **Histórias de Usuário & Critérios de Aceite:**
    *   **US05 (RF09) — Menu Lateral de Navegação (Release 1):** Como usuária, quero um menu consistente que me guie de forma uniforme pelas seções do SafeStreets.
        *   *Critério de Aceite 1:* O menu deve ser responsivo e se ocultar em telas móveis atrás de um menu hambúrguer.
    *   **US12 (RF10) — Dashboard Interativo (Release 2):** Como Dra. Roberta, quero visualizar gráficos estatísticos de commits, PRs e esforços para acompanhar o ritmo operacional e os resultados de entregas do time.
        *   *Critério de Aceite 1:* Os gráficos devem ser interativos, exibindo tooltips informativas ao passar o mouse.
        *   *Critério de Aceite 2:* O dashboard deve puxar dados reais de produtividade sem comprometer o tempo de carregamento inicial da página.
*   **Valor Estratégico:** Promove transparência total do processo de desenvolvimento em MDS e consolida o acompanhamento da produtividade acadêmica e gerencial da equipe.

#### ⚙️ Épico 4: Backend & APIs (Inteligência & Coleta)
*   **Persona Principal:** **Lucas**, desenvolvedor integrador de sistemas que deseja consumir os dados higienizados e inteligíveis de ocorrências do SafeStreets em seu próprio aplicativo de entregas urbanas.
*   **Jornada do Usuário (User Steps):**
    1.  Acessa a documentação da API RESTful do SafeStreets.
    2.  Realiza requisições HTTP GET nos endpoints públicos (ex: `/api/v1/ocorrencias`).
    3.  Recebe payloads JSON rápidos, padronizados e com cabeçalhos de segurança adequados.
*   **Histórias de Usuário & Critérios de Aceite:**
    *   **US06 (RF11) — Raspagem Assíncrona (Release 1):** Como sistema, quero coletar notícias e alertas de segurança pública de fontes governamentais/redes de forma assíncrona para manter nossa base de dados sempre atualizada sem degradar o backend.
        *   *Critério de Aceite 1:* O processo de raspagem deve rodar em background (ex: cron jobs ou Celery/FastAPI BackgroundTasks).
        *   *Critério de Aceite 2:* Dados duplicados ou inconsistentes devem ser filtrados e descartados na ingestão.
    *   **US07 (RF12) — Endpoints RESTful (Release 1):** Como Lucas, quero endpoints HTTP estruturados in JSON para consumir as notícias e pontos de calor georreferenciados no SafeStreets.
        *   *Critério de Aceite 1:* O endpoint de ocorrências deve retornar coordenadas geográficas válidas (latitude/longitude), data e ID padronizados.
        *   *Critério de Aceite 2:* A resposta da API deve ser retornada em menos de 300ms sob cargas moderadas.
    *   **US13 & US14 (RNF03, RNF08) — Segurança, IA e Cache (Release 2):** Como sistema, quero cachear respostas e classificar ocorrências automaticamente usando IA para garantir estabilidade e alta precisão nos dados fornecidos à API.
        *   *Critério de Aceite 1:* Chaves de acesso externas devem estar isoladas em variáveis de ambiente `.env`.
        *   *Critério de Aceite 2:* Endpoints de grande consumo devem implementar cache temporário para evitar bloqueios de taxa (rate limits) e reduzir carga de banco.
*   **Valor Estratégico:** Garante a inteligência analítica, segurança, modularidade (Jamstack) e a capacidade de expansão do ecossistema SafeStreets para parceiros externos.

---

### 🔗 Artefatos de Concepção Visual
*   🎨 **Protótipo de Alta Fidelidade:** [Acesse o Protótipo no Figma](https://www.figma.com/design/ELsAXrAg9XaFQ8MODp3tdA/Prot%C3%B3tipo-de-alta-fidelidade-SafeStreets?node-id=0-1&t=EaSexgw80dwrrPx8-1)
*   <sub style="opacity: 0.75;">🗺️ _Story Map (Quadro de Concepção):_ [Acesse o Story Map no Figma](https://www.figma.com/board/13SnyvGleeaYsubnOhMeYk/Template-MDS-Squad-1?node-id=0-1&t=22K194iRB48CIkId-1) (Link complementar)</sub>
*   📑 **Mapeamento Inicial (Sprint 4):** [Documento do Story Map Inicial](Milestone/Sprint-4/story-map.md)
*   🔄 **Refinamento e Revisão (Sprint 5):** [Revisão do Story Map](Milestone/Sprint-5/revisar-story-map.md)
*   📌 **Estruturação Fina (Sprint 7):** [Versionamento do Story Map](Milestone/Sprint-7/versionamento-story-map.md)

---

## 📑 Requisitos de Produto

Os Requisitos Funcionais (RF) e Não Funcionais (RNF) do projeto SafeStreets estão consolidados em nossa aba de navegação superior:

*   🔗 **Acesse a documentação completa:** [Requisitos do Sistema](requisitos.md)

---

## 📅 Cronograma de Entregas (Milestones & Sprints)

Abaixo está o índice organizado das nossas Sprints, com links para as páginas contendo o planejamento de tarefas e os resultados alcançados em cada etapa:

| Sprint | Período / Foco Principal | Principais Artefatos & Entregas |
| :--- | :--- | :--- |
| **Sprint 0** | Integração e Configuração Inicial | [Estudo Front-End](Milestone/Sprint-0/Estudo-Front-End.md) \| [Git e GitHub](Milestone/Sprint-0/git-github.md) |
| **Sprint 1** | Fundamentação e Infraestrutura | [Ciclo de Software](Milestone/Sprint-1/ciclo-vida-software.md) \| [Docker](Milestone/Sprint-1/docker.md) \| [Estudo Back-End](Milestone/Sprint-1/estudo-back-end.md) \| [Estudo React](Milestone/Sprint-1/estudo-de-react.md) \| [Web Scraping](Milestone/Sprint-1/web-scraping.md) |
| **Sprint 2** | Design da Interface e Conceituação | [Estudo de API](Milestone/Sprint-2/estudo-de-API.md) \| [Preenchimento Figma](Milestone/Sprint-2/Preenchimento-Figma.md) \| [Protótipo de Baixa Fidelidade](Milestone/Sprint-2/protótipo-baixa-fidelidade.md) \| [Estudo de Agentes de IA](Milestone/Sprint-2/estudo-de-agentes-de-IA.md) |
| **Sprint 3** | C4 Model e Estudos Estruturais | [Análise de Implementação](Milestone/Sprint-3/analise-de-implementacao.md) \| [Análise de Linguagens](Milestone/Sprint-3/analise-de-linguagens.md) \| [Documento C4](Milestone/Sprint-3/documento-c4.md) \| [Estudo de Banco de Dados](Milestone/Sprint-3/estudo-banco-de-dados.md) |
| **Sprint 4** | Story Map e DevOps | [Estudo DevOps](Milestone/Sprint-4/estudo-de-devops.md) \| [Story Map](Milestone/Sprint-4/story-map.md) \| [Template de PR](Milestone/Sprint-4/template-pull-request.md) |
| **Sprint 5** | Backend FastAPI e Banco de Dados | [Definições Frontend](Milestone/Sprint-5/definicoes-front-end.md) \| [FastAPI](Milestone/Sprint-5/estudo-fastapi.md) \| [Banco de Dados](Milestone/Sprint-5/implementacao-banco.md) \| [Rever Story Map](Milestone/Sprint-5/revisar-story-map.md) |
| **Sprint 6** | Protótipo de Alta Fidelidade | [Organizar Kanban](Milestone/Sprint-6/organizar_kanban.md) \| [Figma](Milestone/Sprint-6/planejamento_figma.md) \| [Protótipo de Alta Fidelidade](Milestone/Sprint-6/prototipo_alta_fidelidade.md) \| [Template Issue](Milestone/Sprint-6/template_issue.md) |
| **Sprint 7** | Dashboard e Liberação do Release v0.1.0 | [Release Note v0.1.0](Milestone/Sprint-7/conteudo_releasenote_v0.1.0.md) \| [Requisitos](Milestone/Sprint-7/requisitos.md) \| [Dashboard](Milestone/Sprint-7/spec-dashboard.md) \| [Versionamento Story Map](Milestone/Sprint-7/versionamento-story-map.md) |
| **Sprint 8** | Consolidação do Backend | [Definições Backend](Milestone/Sprint-8/definições-de-back.md) |
