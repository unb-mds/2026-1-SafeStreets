# 📑 Requisitos do Projeto SafeStreets

Nesta página estão documentados todos os **Requisitos Funcionais (RF)** e **Requisitos Não Funcionais (RNF)** do **SafeStreets**, mapeados e validados diretamente a partir do backlog de atividades e do [Story Map](planejamento.md#story-map-backlog-de-atividades).

> **Nota:** Os requisitos descrevem o comportamento esperado do sistema (Funcionais) e as restrições de qualidade, segurança e arquitetura aplicadas durante o desenvolvimento (Não Funcionais).

---

## 🗺️ Visão Geral dos Épicos

O backlog de produto do SafeStreets é estruturado em torno de **4 Épicos de desenvolvimento**:

| Épico | Foco Principal | Impacto no Usuário |
| :--- | :--- | :--- |
| **Épico 1: Feed de Notícias** | Manter o cidadão informado | Fornece informações relevantes e locais sobre ocorrências e segurança. |
| **Épico 2: Mapa Interativo** | Núcleo do protótipo | Exibição espacial, busca geográfica e filtragem visual de ocorrências e riscos. |
| **Épico 3: Dashboard & Filtros** | Painel estatístico e analytics | Consolidação de dados em gráficos e indicadores dinâmicos de produtividade. |
| **Épico 4: Backend / APIs** | Infraestrutura e Processamento | Coleta automatizada, classificação por IA e endpoints de dados RESTful. |

> 🎨 **Concepção Visual e Fluxos:** As telas funcionais e interações estão mapeadas no [Protótipo de Alta Fidelidade no Figma](https://www.figma.com/design/ELsAXrAg9XaFQ8MODp3tdA/Prot%C3%B3tipo-de-alta-fidelidade-SafeStreets?node-id=0-1&t=EaSexgw80dwrrPx8-1). <sub style="opacity: 0.85;">Para modelagem ágil de jornadas, consulte o _[Story Map](https://www.figma.com/board/13SnyvGleeaYsubnOhMeYk/Template-MDS-Squad-1?node-id=0-1&t=22K194iRB48CIkId-1)_ (link complementar).</sub>

---

## 🛠️ Requisitos Funcionais (RF)

Os **Requisitos Funcionais** definem as ações específicas, fluxos e comportamentos que o sistema SafeStreets deve executar para atender às necessidades do usuário.

### 📝 Épico 1: Visualização de Informações e Notícias

| ID | Nome do Requisito | Descrição Detalhada |
| :---: | :--- | :--- |
| **RF01** | Feed de Notícias | O sistema deve exibir, na página inicial, um feed de notícias recentes sobre segurança, eventos urbanos e infraestrutura. |
| **RF02** | Detalhamento da Notícia | O sistema deve permitir que o usuário clique em uma notícia para visualizar o conteúdo completo, incluindo data, local geográfico associado e o link da fonte original. |
| **RF03** | Busca de Notícias | O sistema deve disponibilizar um campo de busca para que o usuário filtre as notícias exibidas por palavras-chave. |

### 🗺️ Épico 2: Mapeamento de Ocorrências e Alertas (Core)

| ID | Nome do Requisito | Descrição Detalhada |
| :---: | :--- | :--- |
| **RF04** | Renderização do Mapa | O sistema deve apresentar um mapa interativo integrado à interface principal, exibindo marcadores geográficos das ocorrências mapeadas. |
| **RF05** | Filtros de Ocorrência | O sistema deve disponibilizar um menu lateral de filtros rápidos que permita ao usuário selecionar pontos no mapa por **Tipo de Ocorrência** e **Período/Data** (Ex: últimos 7 dias). |
| **RF06** | Limpeza de Filtros | O sistema deve fornecer uma opção simples para "Limpar filtros", restaurando instantaneamente todos os marcadores originais no mapa. |
| **RF07** | Detalhes da Ocorrência | Ao interagir com um marcador do mapa ou link de notícia relacionado, o sistema deve apresentar um modal de detalhes com o ID da ocorrência (padrão RA-XXXXX), descrição, data e localização. |
| **RF08** | Feedback de Busca Sem Resultados | O sistema deve notificar claramente o usuário com a mensagem *"Nenhum resultado encontrado"* quando nenhum ponto corresponder aos filtros aplicados. |

### 📊 Épico 3: Dashboard de Métricas e Produtividade

| ID | Nome do Requisito | Descrição Detalhada |
| :---: | :--- | :--- |
| **RF09** | Menu de Navegação Lateral | O sistema deve conter um menu lateral consistente com links de navegação para as seções "Início", "Mapa" e "Sobre nós". |
| **RF10** | Painel de Produtividade | O sistema deve processar dados e renderizar um dashboard estatístico contendo gráficos interativos de commits, PRs, esforço e zonas de calor. |

### ⚙️ Épico 4: Integrações e Backend (API)

| ID | Nome do Requisito | Descrição Detalhada |
| :---: | :--- | :--- |
| **RF11** | Consumo de APIs Externas | O backend do sistema deve realizar chamadas assíncronas e coletar dados estruturados de plataformas externas (como GitHub e feeds públicos). |
| **RF12** | Endpoints de Dados | A API do backend deve disponibilizar endpoints estruturados (JSON) permitindo ao frontend consultar notícias, ocorrências, marcadores de mapas e dados estatísticos. |

---

## 🎨 Requisitos Não Funcionais (RNF)

Os **Requisitos Não Funcionais** definem as características de qualidade, infraestrutura, restrições e critérios operacionais que garantem o desempenho premium, a segurança e a manutenibilidade do sistema.

### ⚡ Desempenho e Performance

> **Dica:** A velocidade e a resiliência são fundamentais para assegurar que a plataforma ofereça uma experiência de uso rápida e sem travamentos no cotidiano.

*   **RNF01 - Tempo de Resposta do Mapa:** O mapa interativo deve recalcular e renderizar os novos marcadores em tempo hábil após a aplicação de qualquer combinação de filtros.
*   **RNF02 - Atualização Não Bloqueante (Assíncrona):** O carregamento e renderização do feed inicial de notícias e do mapa de alertas devem ocorrer de forma assíncrona, garantindo que o usuário possa interagir com a interface estrutural enquanto os dados pesados terminam de baixar.
*   **RNF03 - Resiliência contra Limites de Requisições (Rate Limiting):** O backend deve implementar técnicas de cache (ex: Redis ou in-memory temporário) para evitar o bloqueio de consumo por excesso de requisições às APIs públicas de terceiros.

### 🎨 IHC & Experiência de Interface

*   **RNF04 - Responsividade Adaptativa:** A interface do sistema deve adaptar-se e ser 100% amigável para dispositivos móveis, tablets e telas desktop de forma limpa e flexível.
*   **RNF05 - Fidelidade Visual (Figma):** A implementação visual dos elementos estruturais (paleta de cores, tipografia, espaçamento e componentes interactivos) deve manter aderência estrita às especificações validadas no *Protótipo de Alta Fidelidade do Figma*.

### 🔒 Segurança e Privacidade de Dados

> **Atenção:** Informações confidenciais e chaves de APIs críticas jamais devem ser trafegadas ou expostas no código público do lado do cliente (Frontend).

*   **RNF06 - Tráfego de Dados Criptografado (HTTPS):** Toda a troca de dados entre o navegador do usuário, o frontend estático e as APIs do backend deve ocorrer exclusivamente sob o protocolo de segurança **HTTPS** com criptografia SSL/TLS.
*   **RNF07 - Proteção e Isolamento de Chaves:** Credenciais do banco de dados, tokens de serviços de terceiros e segredos de desenvolvimento devem ser isolados em arquivos de configuração locais (`.env`) e carregados estritamente na camada de servidor (Backend).

### 🏗️ Arquitetura e Manutenibilidade

*   **RNF08 - Desacoplamento entre Camadas (Jamstack / REST):** O frontend deve se comunicar com as fontes de dados e serviços do backend única e exclusivamente por meio de chamadas HTTP para uma API RESTful. Isso garante isolamento completo de tecnologias e facilidade de manutenção em repositórios separados.
