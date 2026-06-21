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
* US 1.1.2 Como cidadão, quero abrir uma notícia para visualizar detalhes completos da ocorrência para adquirir maior entendimento da ocorrência.
* US 1.1.3 Como cidadão, quero ter acesso ao menu da web-site para me redirecionar a outros conteúdos.

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
  
  Ao aplicar uma busca (via filtros e/ou barra de busca), o sistema deve exibir, abaixo da barra de busca, a lista de notícias de monitoramento urbano correspondentes aos critérios.
* **RF07 - Feedback de Busca Vazia:** O sistema deve exibir a mensagem *"Nenhum resultado encontrado"* caso os filtros aplicados não encontrem nenhuma ocorrência no mapa.
* **RF08 - Limpeza de Filtros:** O sistema deve fornecer uma opção para "Limpar filtros".
* **RF09 - Painel de Produtividade Dinâmico:** O sistema deve renderizar um dashboard estatístico contendo gráficos interativos com a consolidação de dados operacionais.
* **RF10 - Card Resumo da Ocorrência:** Ao selecionar uma notícia na lista de resultados do dashboard de busca, o sistema deve posicionar um marcador (pin) no mapa correspondente à localização da ocorrência e exibir, acima do pin, um card resumo contendo risco, título, número identificador (RA-XXXXX), localização exata e data. O resumo gerado por IA não é exibido neste card.
* **RF11 - Gerar Resumo de IA:** Ao clicar na opção "Ver detalhes" do card resumo, o sistema deve abrir uma nova tela exibindo as especificações completas da ocorrência e um resumo gerado por IA.

**User Stories:**
* US 3.3.1 Como cidadão, quero buscar notícias de monitoramento urbano por região administrativa (RA) e ter a opção de filtrar por intervalos de tempo.
* US 3.3.2 Como cidadão, quero que a mensagem "nenhum resultado encontrado" seja exibida, caso nenhuma notícia seja encontrada ao buscar.
* US 3.3.3 Como cidadão, quero que tenha uma opção de limpar filtros.
* US 3.3.4 Como cidadão, quero que os dados sejam carregados na dashboard automaticamente para visualização de monitoramento urbano após a busca.
* US 3.3.5 Como cidadão, quero visualizar um card contendo informações  e indicadores (risco e período) sobre o local.
* US 3.3.6 Como cidadão, quero que ao buscar minha região no mapa e selecioná-la, apareça um resumo gerado automaticamente com auxílio da IA.

### ⚙️ Épico 4: Sistema (Backend/API)

* **RF12 - Enriquecimento de Ocorrências:** O sistema deve, durante o pipeline de ingestão, extrair e normalizar a localização geográfica de cada notícia (nome de região administrativa → lat/long centroide) e limpar o conteúdo bruto (remoção de HTML, normalização de caracteres). O sistema **não classifica tipos de crime**.
* **RF13 - Disponibilização de Endpoints:** A API do backend deve disponibilizar endpoints estruturados para o fornecimento dos dados de notícias de monitoramento urbano, marcadores do mapa e estatísticas para o frontend.
* **RF14 - Consumo de APIs Externas:** O backend deve realizar requisições e coletar dados de fontes externas de forma assíncrona para alimentar as métricas do painel.
* **RF15 - Retornar Respostas (JSON)** O sistema deve retornar respostas em json.

**User Stories:**
* US 4.4.1 Como desenvolvedor, quero implementar a lógica de extração de localização geográfica (texto → RA + lat/long) e limpeza de conteúdo para enriquecer as ocorrências no pipeline de ingestão.
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

---

## 4. Critérios de Aceite das User Stories (Épicos 1 a 4)

### 🛠️ Épico 1: Visualização de Informações e Notícias

**US 1.1.1** — Como cidadão, quero acessar a página de informações sobre crimes na região do DF para me informar sobre a segurança.
* Dado que o usuário acessa a página inicial, então o sistema deve exibir um feed com as notícias de monitoramento urbano mais recentes sobre segurança pública no DF.
* Dado que o feed está sendo carregado, então a renderização dos componentes estruturais da página não deve ser bloqueada (carregamento assíncrono).
* Dado que não há notícias disponíveis, então o sistema deve exibir uma mensagem indicando ausência de conteúdo, sem quebrar o layout da página.

**US 1.1.2** — Como cidadão, quero abrir uma notícia para visualizar detalhes completos da ocorrência para adquirir maior entendimento da ocorrência.
* Dado que o usuário clica em uma notícia do feed, então o sistema deve exibir a descrição detalhada da ocorrência.
* Dado que a notícia está em exibição detalhada, então o sistema deve exibir a data de publicação e a localização associada à ocorrência.
* Dado que a notícia está em exibição detalhada, então o sistema deve exibir um link de acesso à fonte original dos dados, e esse link deve abrir a fonte externa.

**US 1.1.3** — Como cidadão, quero ter acesso ao menu da web-site para me redirecionar a outros conteúdos.
* Dado que o usuário está em qualquer página do sistema, então o menu lateral deve estar visível e acessível.
* Dado que o usuário clica em "Início", então o sistema deve redirecionar para a página inicial com o feed de notícias.
* Dado que o usuário clica em "Mapa", então o sistema deve redirecionar para a página do mapa interativo.
* Dado que o usuário clica em "Sobre nós", então o sistema deve redirecionar para a página com informações institucionais do projeto.

### 🗺️ Épico 2: Mapeamento de Ocorrências e Alertas

**US 2.2.1** — Como cidadão, quero que ao selecionar uma notícia de monitoramento urbano no dashboard de pesquisa, um card resumo apareça linkado ao local por um marcador (pin) no mapa.
* Dado que o usuário seleciona uma notícia no dashboard de pesquisa, então o sistema deve exibir um card resumo acima do pin contendo os detalhes da ocorrência correspondente.
* Dado que o card resumo é exibido, então o sistema deve destacar/posicionar um marcador (pin) no mapa correspondente à localização da ocorrência.
* Dado que o usuário seleciona outra notícia, então o card resumo e o marcador no mapa devem ser atualizados de acordo com a nova seleção.

**US 2.2.2** — Como cidadão, quero que o mapa interativo carregue ao acessar o sistema, já exibindo regiões do DF, para que eu possa começar a explorar as áreas imediatamente.
* Dado que o usuário acessa a página do mapa, então o mapa interativo deve ser renderizado automaticamente, sem necessidade de ação adicional do usuário.
* Dado que o mapa foi renderizado, então ele deve ser exibido com zoom padrão centralizado na região do Distrito Federal.
* Dado que o mapa está carregado, então o usuário deve conseguir explorar (arrastar, dar zoom in/out) as regiões exibidas livremente.

### 📊 Épico 3: Dashboard de Busca/Filtros

**US 3.3.1** — Como cidadão, quero buscar notícias de monitoramento urbano por região administrativa (RA) e ter a opção de filtrar por intervalos de tempo.
* Dado que o usuário acessa o menu lateral de filtros, então deve haver um campo/seletor para escolher uma região administrativa (Ex: Ceilândia, Taguatinga).
* Dado que o usuário acessa o menu lateral de filtros, então deve haver uma opção para definir um período/intervalo de datas.
* Dado que o usuário aplica um filtro de região e/ou período, então o sistema deve exibir, abaixo da barra de busca, a lista de notícias de monitoramento urbano que atendem aos critérios selecionados.
* Dado que o usuário combina filtro de região e período, então o sistema deve aplicar ambos os critérios simultaneamente (interseção).

**US 3.3.2** — Como cidadão, quero que a mensagem "nenhum resultado encontrado" seja exibida, caso nenhuma notícia seja encontrada ao buscar.
* Dado que o usuário aplica um ou mais filtros, e nenhuma ocorrência atende aos critérios, então o sistema deve exibir a mensagem "Nenhum resultado encontrado".
* Dado que a mensagem "Nenhum resultado encontrado" está sendo exibida, então o mapa não deve apresentar marcadores e o dashboard não deve apresentar dados de ocorrências.
* Dado que o usuário altera os filtros para critérios que retornam resultados, então a mensagem "Nenhum resultado encontrado" deve desaparecer e os dados correspondentes devem ser exibidos.

**US 3.3.3** — Como cidadão, quero que tenha uma opção de limpar filtros.
* Dado que o usuário possui um ou mais filtros aplicados, então deve haver um botão/opção "Limpar filtros" visível no menu de filtros.
* Dado que o usuário clica em "Limpar filtros", então todos os filtros aplicados (região e período) devem ser removidos.
* Dado que os filtros foram limpos, então o mapa e o dashboard devem voltar ao estado padrão.

**US 3.3.4** — Como cidadão, quero que os dados sejam carregados na dashboard automaticamente para visualização de monitoramento urbano após a busca.
* Dado que o usuário realiza uma busca/aplica filtros, então o dashboard de busca deve ser atualizado automaticamente com os dados consolidados correspondentes, sem necessidade de recarregar a página.
* Dado que a atualização do dashboard está em andamento, então o sistema deve indicar visualmente o estado de carregamento (loading) até que os dados estejam disponíveis.

**US 3.3.5** — Como cidadão, quero visualizar um card contendo informações e indicadores (risco e período) sobre o local.
* Dado que o usuário selecione uma notícia na lista de resultados do dashboard, então o sistema deve posicionar um marcador (pin) no mapa correspondente à localização da ocorrência.
* Dado que o marcador é posicionado, então o sistema deve exibir, acima do pin, um card resumo pequeno contendo: nível de risco, título, número identificador (RA-XXXXX), localização exata e data da ocorrência, sem o resumo gerado por IA.
* Dado que o card resumo é exibido, então as informações de risco e período devem corresponder à ocorrência buscada.

**US 3.3.6** — Como cidadão, quero que ao buscar/selecionar minha nóticia no dashboard de pesquisa e aparecer o pin com o card resumo acima dela, tenha uma opção de "Ver detalhes" no card resumo que irá gerar uma nova tela contendo, além das especificações da notícia, um resumo gerado por inteligência artificial.
* Dado que o usuário busca/seleciona uma notícia no dashboard de pesquisa, então o sistema deve exibir o pin correspondente no mapa com o card resumo posicionado acima dele.
* Dado que o card resumo está sendo exibido, então deve haver uma opção "Ver detalhes" visível no card.
* Dado que o usuário clica em "Ver detalhes", então o sistema deve abrir uma nova tela contendo as especificações completas da notícia (título, número identificador, localização, data e risco).
* Dado que a nova tela de detalhes é exibida, então o sistema deve apresentar um resumo gerado por inteligência artificial referente à ocorrência selecionada.
* Dado que o resumo gerado por IA está sendo carregado, então o sistema deve indicar visualmente o estado de carregamento até que o conteúdo esteja disponível.
* Dado que não seja possível gerar o resumo por IA para a ocorrência selecionada, então o sistema deve exibir uma mensagem informando a indisponibilidade do resumo.

### ⚙️ Épico 4: Sistema (Backend/API)

**US 4.4.1** — Como desenvolvedor, quero implementar a lógica de extração de localização geográfica (texto → RA + lat/long) e limpeza de conteúdo para enriquecer as ocorrências no pipeline de ingestão.
* Dado que uma notícia bruta entra no pipeline de ingestão, então o sistema deve identificar no texto o nome da região administrativa e convertê-lo nas coordenadas (lat/long) do centroide da RA.
* Dado que as coordenadas são geradas, então elas devem ser armazenadas dentro dos ranges válidos (latitude ∈ [-90, 90], longitude ∈ [-180, 180]) e com a precisão definida na arquitetura (6 casas decimais).
* Dado que o conteúdo bruto contém marcação HTML e caracteres não normalizados, então o sistema deve remover as tags HTML e normalizar os caracteres antes de persistir a ocorrência.
* Dado que não é possível identificar a região administrativa no texto, então o sistema deve registrar a ocorrência sem coordenadas (localização indefinida), sem interromper o processamento das demais notícias.
* Dado que uma ocorrência é enriquecida, então o sistema **não** deve classificar nem atribuir tipo de crime (fora do escopo, conforme RF12).

**US 4.4.2** — Como desenvolvedor, quero criar endpoints para disponibilizar dados ao sistema.
* Dado que o frontend requisita a coleção de ocorrências, então a API deve expor um endpoint que retorna a lista de notícias de monitoramento urbano com seus marcadores.
* Dado que o frontend requisita uma ocorrência específica pelo seu identificador, então a API deve expor um endpoint que retorna os detalhes daquela ocorrência.
* Dado que o recurso solicitado não existe, então a API deve responder com status HTTP 404 e o envelope de erro padronizado.
* Dado que a API está no ar, então a documentação automática (Swagger/OpenAPI) deve listar os endpoints disponíveis para consulta pelo time.

**US 4.4.3** — Como desenvolvedor, quero que o sistema processe requisições do usuário para retornar os dados corretos.
* Dado que o usuário aplica filtros (região administrativa e/ou período), então a API deve processar os parâmetros e retornar somente as ocorrências que atendem aos critérios.
* Dado que o usuário combina filtro de região e período, então a API deve aplicar ambos os critérios simultaneamente (interseção).
* Dado que os parâmetros da requisição são inválidos (ex.: `data_inicio` posterior a `data_fim`, ou RA fora do formato `RA-XXX`), então a API deve responder com status HTTP 400 e uma mensagem de erro descritiva.
* Dado que nenhum registro atende aos critérios informados, então a API deve retornar uma lista vazia (`data: []`) com sucesso — não um erro.

**US 4.4.4** — Como desenvolvedor, quero que o sistema retorne respostas em JSON para garantir integração com o front-end.
* Dado que qualquer endpoint da API é chamado, então a resposta deve ter `Content-Type: application/json`.
* Dado que a operação é bem-sucedida, então o corpo deve seguir o envelope padrão `{ "success": true, "data": ... }`.
* Dado que ocorre um erro, então o corpo deve seguir o envelope `{ "success": false, "error": { "codigo", "mensagem", "detalhe" } }`.
* Dado que o resumo gerado por IA (Gemini) não pôde ser produzido, então a resposta deve trazer `resumo_status = "ERRO"` e o campo de resumo nulo, sem falhar a requisição (conforme decisão do [ADR-001](../Arquitetura/ADR-001-Gemini-Fallback-Strategy.md), Opção A).
