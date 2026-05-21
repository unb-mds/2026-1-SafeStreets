# 📑 Requisitos Funcionais e Não Funcionais do Projeto SafeStreets

## 1. Estrutura do Story Map (Extraída do Backlog)

O projeto está dividido em **4 Épicos principais**, mapeados diretamente no Story Map do time:

1. **Épico 1: Página de Notícias** (Focado em manter o cidadão informado).
2. **Épico 2: Mapa interativo** (O núcleo do sistema: interagir com o mapa urbano).
3. **Épico 3: Dashboard de Busca/Filtros** (Painel estatístico dinâmico de produtividade e dados operacionais).
4. **Épico 4: Sistema (Backend/API)** (Fornecimento de dados, processamento de requisições e integração).

---

## 2. Requisitos Funcionais (RF) — *O que o sistema faz*

### 🛠️ Épico 1: Visualização de Informações e Notícias

* **RF01 - Feed de Notícias:** O sistema deve exibir, na página inicial, um feed de notícias recentes sobre segurança, eventos urbanos e infraestrutura.
* **RF02 - Detalhamento da Notícia:** O sistema deve permitir que o usuário clique em uma notícia do feed para ler a descrição detalhada, visualizar a data de publicação, local associado e acessar o link original da fonte.
* **RF03 - Busca de Notícias:** O sistema deve disponibilizar uma barra de pesquisa para que o usuário busque notícias por palavras-chave.

### 🗺️ Épico 2: Mapeamento de Ocorrências e Alertas (Core do Protótipo)

* **RF04 - Renderização do Mapa:** O sistema deve apresentar um mapa interativo integrado à interface principal, exibindo marcadores de pontos de interesse e ocorrências.
* **RF05 - Filtro de Ocorrências:** O sistema deve disponibilizar um menu lateral de filtros que permita ao usuário refinar os pontos exibidos no mapa por:
  * *Tipo de Ocorrência* (Ex: Via Pública, Iluminação, Segurança).
  * *Período/Data* (Ex: Últimos 7 dias, mês atual).
* **RF06 - Limpeza de Filtros:** O sistema deve fornecer uma opção para "Limpar filtros", restaurando a visualização padrão de todos os pontos no mapa.
* **RF07 - Detalhes do Ponto/Ocorrência:** Ao clicar em um marcador ou notícia vinculada ao mapa, o sistema deve exibir um modal ou página de detalhes contendo o título, número identificador (RA-XXXXX), localização exata e data.
* **RF08 - Feedback de Busca Vazia:** O sistema deve exibir a mensagem *"Nenhum resultado encontrado"* caso os filtros aplicados não encontrem nenhuma ocorrência no mapa.

### 📊 Épico 3: Dashboard de Métricas e Filtros

* **RF09 - Menu de Navegação:** O sistema deve conter um menu lateral com links diretos para as seções "Início", "Mapa" e "Sobre nós".
* **RF10 - Painel de Produtividade Dinâmico:** O sistema deve renderizar um dashboard estatístico contendo gráficos interativos com a consolidação de dados operacionais.

### ⚙️ Épico 4: Sistema (Backend/API)

* **RF11 - Consumo de APIs Externas:** O backend deve realizar requisições e coletar dados de fontes externas de forma assíncrona para alimentar as métricas do painel.
* **RF12 - Disponibilização de Endpoints:** A API do backend deve disponibilizar endpoints estruturados para o fornecimento dos dados de notícias, marcadores do mapa e estatísticas para o frontend.

---

## 3. Requisitos Não Funcionais (RNF) — *Como o sistema faz (Qualidade)*

### ⚡ Desempenho e Performance (Métrica de Tempo)

* **RNF01 - Tempo de Resposta do Mapa:** O mapa interativo deve renderizar todos os marcadores da região selecionada após a aplicação de um filtro, sob conexões padrão.
* **RNF02 - Atualização do Feed:** O carregamento do feed inicial de notícias não deve bloquear a renderização dos componentes estruturais da página (carregamento assíncrono).
* **RNF03 - Resiliência contra Limites de API (Rate Limiting):** O backend deve implementar mecanismos de cache ou filas para evitar o bloqueio por excesso de requisições ao consumir serviços externos (como a API do GitHub).

### 🎨 Usabilidade e Interface (IHC)

* **RNF04 - Responsividade:** A interface do sistema deve ser totalmente responsiva, adaptando-se perfeitamente para desktops, conforme desenhado nas telas do protótipo.
* **RNF05 - Aderência ao Protótipo:** Os componentes visuais implementados (botões, menus e modais) devem seguir estritamente o guia de estilos, paleta de cores e tipografia definidos no *Protótipo de Alta Fidelidade do Figma*.

### 🔒 Segurança e Privacidade de Dados

* **RNF06 - Comunicação Segura:** O tráfego de dados entre o frontend e a API do sistema deve ser feito exclusivamente sob o protocolo criptografado **HTTPS**.
* **RNF07 - Proteção de Variáveis de Ambiente:** Chaves de API e credenciais de bancos de dados não devem ser expostas no código do frontend, devendo ser armazenadas e tratadas estritamente em ambiente seguro de backend.

### 🛠️ Manutenibilidade e Arquitetura

* **RNF08 - Separação de Camadas (Desacoplamento - Jamstack):** A camada de visualização (Frontend) deve interagir com as fontes de dados (Backend/APIs) estritamente por meio de chamadas de API RESTful, permitindo a evolução independente do código sem quebra de regras de negócio.
