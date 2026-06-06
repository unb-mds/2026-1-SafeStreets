# 📑 Requisitos Funcionais e Não Funcionais do Projeto SafeStreets

> **Glossário de termos**: Veja [docs/Arquitetura/CONTEXT.md](../Arquitetura/CONTEXT.md) para definições de Notícia, Ocorrência, Marcador, Dashboard, etc.

## 1. Estrutura do Story Map (Extraída do Backlog)

O projeto está dividido em **4 Épicos principais**, mapeados diretamente no Story Map do time:

1. **Épico 1: Visualização de Informações e Notícias** (Focado em manter o cidadão informado).
2. **Épico 2: Mapeamento de Ocorrências e Alertas** (O núcleo do sistema: interagir com o mapa urbano).
3. **Épico 3: Dashboard de Busca/Filtros** (Painel estatístico dinâmico de produtividade e dados operacionais).
4. **Épico 4: Sistema (Backend/API)** (Fornecimento de dados, processamento de requisições e integração).

---

## 2. Requisitos Funcionais (RF) — *O que o sistema faz*

### 🛠️ Épico 1: Visualização de Informações e Notícias

* **RF01 - Visualizar página de notíciam:** O sistema deve exibir, na página inicial, um feed de notícias de monitoramento urbano sobre segurança pública no DF.
* **RF02 - Detalhamento da Notícia:** O sistema deve permitir que o usuário clique em uma notícia de monitoramento urbano do feed para ler a descrição detalhada da ocorrência, visualizar a data de publicação, localização associada e acessar o link original da fonte de dados.
* **RF03 - Menu de Navegação:** O sistema deve conter um menu lateral com links diretos para as seções "Início", "Mapa" e "Sobre nós".

**User Stories:**
* US 1.1.1 Como cidadão, quero acessar a página de informações sobre crimes na região do DF para me informar sobre a segurança.
* US 1.1.2 Como cidadão, quero abrir uma notícia para visualizar detalhes completos da ocorrência.
* US 1.1.3 Como cidadão, quero ter acesso ao menu da web-site redirecionando a outros conteúdos.

### 🗺️ Épico 2: Mapeamento de Ocorrências e Alertas

* **RF04 - Card Resumo:** O sistema deve disponibilizar, após a seleção de uma notícia de monitoramento urbano, um card resumo contendo detalhes da ocorrência linkada ao local por um marcador (pin).
* **RF05 - Renderização do Mapa:** O sistema deve apresentar um mapa interativo integrado à interface principal que exibe marcadores representando ocorrências. O mapa pode ser explorado e será carregado com zoom padrão centralizado no DF.

**User Stories:**
* US 2.2.1 Como cidadão, quero que ao selecionar uma notícia de monitoramento urbano no dashboard, um card resumo apareça linkado ao local por um marcador (pin) no mapa.
* US 2.2.2 Como cidadão, quero que o mapa interativo carregue ao acessar o sistema, já exibindo regiões do DF, para que eu possa começar a explorar as áreas imediatamente.

### 📊 Épico 3: Dashboard de Busca/Filtros

* **RF06 - Filtro de Ocorrências:** O sistema deve disponibilizar um menu lateral de filtros que permita ao usuário refinar os pontos exibidos no mapa por:
  * *Região administrativa* (Ex: Ceilândia, Taguatinga).
  * *Período/Data* .
* **RF07 - Feedback de Busca Vazia:** O sistema deve exibir a mensagem *"Nenhum resultado encontrado"* caso os filtros aplicados não encontrem nenhuma ocorrência no mapa.
* **RF08 - Limpeza de Filtros:** O sistema deve fornecer uma opção para "Limpar filtros".
* **RF09 - Painel de Produtividade Dinâmico:** O sistema deve renderizar um dashboard estatístico contendo gráficos interativos com a consolidação de dados operacionais.
* **RF10 - Detalhes do Ponto/Ocorrência:** Ao clicar em um marcador no mapa ou selecionar uma notícia de monitoramento urbano no dashboard, o sistema deve exibir um card resumo contendo risco, título, número identificador (RA-XXXXX), localização exata, data e resumo gerado por IA.
* **RF11 - Gerar Resumo de IA:** O sistema deve exibir um resumo gerado por IA, ao selecionar uma região no mapa.

**User Stories:**
* US 3.3.1 Como cidadão, quero buscar notícias de monitoramento urbano por região administrativa (RA) e ter a opção de filtrar por intervalos de tempo.
* US 3.3.2 Como cidadão, quero que a mensagem "nenhum resultado encontrado" seja exibida, caso nenhuma notícia seja encontrada ao buscar.
* US 3.3.3 Como cidadão, quero que tenha uma opção de limpar filtros.
* US 3.3.4 Como cidadão, quero que os dados sejam carregados na dashboard automaticamente para visualização de monitoramento urbano após a busca.
* US 3.3.5 Como cidadão, quero visualizar um card contendo informações  e indicadores (risco e período) sobre o local.
* US 3.3.6 Como cidadão, quero que ao buscar minha região no mapa e selecioná-la, apareça um resumo gerado automaticamente com auxílio da IA.

### ⚙️ Épico 4: Sistema (Backend/API)

* **RF12 - Classificação de Ocorrências:** O sistema deve classificar automaticamente os tipos de crimes e incidentes associados a cada ocorrência durante o pipeline de ingestão de dados.
* **RF13 - Disponibilização de Endpoints:** A API do backend deve disponibilizar endpoints estruturados para o fornecimento dos dados de notícias de monitoramento urbano, marcadores do mapa e estatísticas para o frontend.
* **RF14 - Consumo de APIs Externas:** O backend deve realizar requisições e coletar dados de fontes externas de forma assíncrona para alimentar as métricas do painel.
* **RF15 - Retornar Respostas (JSON)** O sistema deve retornar respostas em json.

**User Stories:**
* US 4.4.1 Como desenvolvedor, quero implementar a lógica de classificação de tipos de crimes para enriquecer as ocorrências no pipeline de ingestão.
* US 4.4.2 Como desenvolvedor, quero criar endpoints para disponibilizar dados ao sistema.
* US 4.4.3 Como desenvolvedor, quero que o sistema processe requisições do usuário para retornar os dados corretos.
* US 4.4.4 Como desenvolvedor, quero que o sistema retorne respostas em JSON para garantir integração com o front-end.

---

## 3. Requisitos Não Funcionais (RNF) — *Como o sistema faz (Qualidade)*

### ⚡ Desempenho e Performance (Métrica de Tempo)

* **RNF01 - Tempo de Resposta do Mapa:** O mapa interativo deve renderizar todos os marcadores da região selecionada após a aplicação de um filtro, sob conexões padrão.
* **RNF02 - Atualização do Feed:** O carregamento do feed inicial de notícias não deve bloquear a renderização dos componentes estruturais da página (carregamento assíncrono).
* **RNF03 - Resiliência contra Limites de API (Rate Limiting):** O backend deve implementar mecanismos de cache ou filas para evitar o bloqueio por excesso de requisições ao consumir serviços externos (como a API do GitHub).

### 🎨 Usabilidade e Interface (IHC)

* **RNF04 - Compatibilidade de Plataforma (Foco Desktop):** A interface do sistema deve ser otimizada para visualização e interação exclusivas em ambientes **Desktop/Web**, adaptando-se às resoluções de monitores de computadores conforme detalhado nas telas do protótipo do Figma.
* **RNF05 - Aderência ao Protótipo:** Os componentes visuais implementados (botões, menus e modais) devem seguir estritamente o guia de estilos, paleta de cores e tipografia definidos no *Protótipo de Alta Fidelidade do Figma*.

### 🔒 Segurança e Privacidade de Dados

* **RNF06 - Comunicação Segura:** O tráfego de dados entre o frontend e a API do sistema deve ser feito exclusivamente sob o protocolo criptografado **HTTPS**.
* **RNF07 - Proteção de Variáveis de Ambiente:** Chaves de API e credenciais de bancos de dados não devem ser expostas no código do frontend, devendo ser armazenadas e tratadas estritamente em ambiente seguro de backend.

### 🛠️ Manutenibilidade e Arquitetura

* **RNF08 - Separação de Camadas (Desacoplamento - Jamstack):** A camada de visualização (Frontend) deve interagir com as fontes de dados (Backend/APIs) estritamente por meio de chamadas de API RESTful, permitindo a evolução independente do código sem quebra de regras de negócio.
