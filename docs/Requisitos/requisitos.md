# 📑 Requisitos Funcionais e Não Funcionais do Projeto SafeStreets

## 1. Estrutura do Story Map (Extraída do Backlog)

O projeto está dividido em **4 Épicos principais**, mapeados diretamente no Story Map do time:

1. **Épico 1: Visualização de Informações e Notícias** (Focado em manter o cidadão informado).
2. **Épico 2: Mapeamento de Ocorrências e Alertas** (O núcleo do sistema: interagir com o mapa urbano).
3. **Épico 3: Dashboard de Busca/Filtros** (Painel estatístico dinâmico de produtividade e dados operacionais).
4. **Épico 4: Sistema (Backend/API)** (Fornecimento de dados, processamento de requisições e integração).

---

## 2. Requisitos Funcionais (RF) — *O que o sistema faz*

### 🛠️ Épico 1: Visualização de Informações e Notícias

* **RF01 - Visualizar página de notícia:** O sistema deve exibir, na página inicial, um feed de notícias sobre segurança.
* **RF02 - Detalhamento da Notícia:** O sistema deve permitir que o usuário clique em uma notícia do feed para ler a descrição detalhada, visualizar a data de publicação, local associado e acessar o link original da fonte.
* **RF03 - Menu de Navegação:** O sistema deve conter um menu lateral com links diretos para as seções "Início", "Mapa" e "Sobre nós".

**User Stories:**
* US 1.1.1 Como cidadão, quero acessar a página de informações sobre crimes na região do DF para me informar sobre a segurança.
* US 1.1.2 Como cidadão, quero abrir uma notícia para visualizar detalhes completos da ocorrência para adquirir maior entendimento da ocorrência.
* US 1.1.3 Como cidadão, quero ter acesso ao menu da web-site para me redirecionar a outros conteúdos.

### 🗺️ Épico 2: Mapeamento de Ocorrências e Alertas

* **RF04 - Renderização do Mapa:** O sistema deve apresentar um mapa interativo integrado à interface principal, que pode ser explorado e será carregado com zoom padrão centralizado no DF.
* **RF05 - Card Resumo:** O sistema deve disponibilizar após a seleção de uma notícia, um card resumo linkado ao local por um pin.

**User Stories:**
* US 2.2.1 Como cidadão, quero que o mapa interativo carregue ao acessar o sistema, já exibindo regiões do DF, para que eu possa começar a explorar as áreas imediatamente.
* US 2.2.2 Como cidadão, quero que ao selecionar a notícia pelo dashboard um card resumo apareça linkado ao local por um PIN, para que eu possa ter uma breve noção do teor da notícia.

### 📊 Épico 3: Dashboard de Busca/Filtros

* **RF06 - Filtro de Ocorrências:** O sistema deve disponibilizar um menu lateral de filtros que permita ao usuário refinar os pontos exibidos no mapa por:
  * *Região administrativa* (Ex: Ceilândia, Taguatinga).
  * *Período/Data* .
* **RF07 - Feedback de Busca Vazia:** O sistema deve exibir a mensagem *"Nenhum resultado encontrado"* caso os filtros aplicados não encontrem nenhuma ocorrência no mapa.
* **RF08 - Busca:** O sistema deve disponibilizar uma aba de pesquisa.
* **RF09 - Limpeza de Filtros:** O sistema deve fornecer uma opção para "Limpar filtros".
* **RF10 - Consumir Dados da API:** O sistema deve disponibilizar um campo com as notícias encontradas (com RA, localização e data).
* **RF11 - Detalhes do Ponto/Ocorrência:** Ao clicar em uma notícia vinculada ao dashboard de busca, o sistema deve exibir um card no mapa contendo o título, número identificador (RA-XXXXX), localização e data.
* **RF12 - Ver Detalhes:** O sistema deve apresentar ao pesquisar e clicar em uma notícia, uma opção de detalhamento.
* **RF13 - Quadro de periculosidade** Após o usuário clicar na opção “Ver detalhes”, o sistema deve apresentar um dashboard com as especificações da notícia e um resumo gerado por IA. Dentre as especificações teremos o nome da região, nível de risco e a data do ocorrido. O nível de risco será representado tanto visualmente por cores, quanto por escrita. 
* **RF14 - Gerar Resumo de IA:** O sistema deve exibir um resumo gerado por IA, ao clicar em Ver Detalhes.

**User Stories:**
* US 3.3.1 Como cidadão, quero buscar informações por RA, e ter a opção de filtrar as notícias em intervalos de tempo, para ter um maior entendimento dos ocorridos recentes.
* US 3.3.2 Como cidadão, quero que a mensagem "nenhum resultado encontrado" seja exibida, caso nenhuma notícia seja encontrada ao buscar, para eu ter certeza de que não teve realmente nenhum resultado.
* US 3.3.3 Como cidadão, quero poder buscar o título da notícia para saber quão frequente ocorre esse tipo de crime.
* US 3.3.4 Como cidadão, quero que tenha uma opção de limpar filtros, para facilitar o retorno a busca.
* US 3.3.5 Como cidadão, quero que os dados sejam carregados na dashboard automaticamente para melhor visualização dos resultados.
* US 3.3.6 Como cidadão, quero visualizar um card contendo informações e indicadores sobre o local, para entender quando e onde ocorreu.
* US 3.3.7 Como cidadão, quero poder ver mais detalhes da notícia, para me informar mais.
* US 3.3.8 Como cidadão, quero obter o nível de periculosidade da região, e um resumo da notícia, para me manter informado e precavido.
* US 3.3.9 Como cidadão, quero que ao buscar minha região no mapa e selecioná-la, apareça um resumo gerado automaticamente com auxílio da IA, para que eu possa visualizar a notícia de forma mais completa e resumida.

### ⚙️ Épico 4: Sistema (Backend/API)

* **RF15 - Disponibilização de Endpoints:** A API do backend deve disponibilizar endpoints estruturados para o fornecimento dos dados de notícias, marcadores do mapa e estatísticas para o frontend.
* **RF16 - Consumo de APIs Externas:** O backend deve realizar requisições e coletar dados de fontes externas de forma assíncrona para alimentar as métricas do painel.
* **RF17 - Retornar Respostas (JSON)** O sistema deve retornar respostas em json.

**User Stories:**
* US 4.4.1 Como desenvolvedor, quero criar endpoints para disponibilizar dados ao sistema.
* US 4.4.2 Como desenvolvedor, quero que o sistema processe requisições do usuário para retornar os dados corretos.
* US 4.4.3 Como desenvolvedor, quero que o sistema retorne respostas em JSON para garantir integração com o front-end.

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
