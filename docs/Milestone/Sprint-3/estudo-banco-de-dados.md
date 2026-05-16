# Estudo de banco de dados
## Participantes:
- Jorge Vásquez
- Edson Gabriel

Um banco de dados é uma coleção organizada de dados que podem ser armazenados, acessados e gerenciados de forma eficiente em um sistema computacional. Esses dados podem representar diversas informações, como registros de clientes, produtos, transações ou qualquer outro tipo de conteúdo relevante para uma aplicação. A principal função de um banco de dados é permitir que essas informações sejam estruturadas de maneira lógica, facilitando sua consulta, atualização e análise.

### A Estrutura e o Gerenciamento
---

Para que um banco de dados funcione, ele precisa de um "cérebro" chamado **Sistema Gerenciador de Banco de Dados (SGBD)** ou, em inglês, *Database Management System*. O SGBD é o software que interage com o usuário, com outras aplicações e com o próprio banco de dados para capturar e analisar as informações.

### Exemplos de SGBDs
---

- Oracle
- SQL Server
- PostgreSQL
- MySQL

### Tipos Principais de Bancos de Dados
---

Dependendo da natureza dos dados e da necessidade do projeto, existem diferentes modelos:

- **Relacionais (SQL):** Os dados são organizados em tabelas com linhas e colunas. Eles utilizam a Linguagem de Consulta Estruturada (SQL) para escrever e consultar dados. São ideais para sistemas que exigem consistência rigorosa, como transações bancárias ou registros acadêmicos.
- **Não Relacionais (NoSQL):** Neste caso não segue o modelo rígido de tabelas. Eles podem armazenar dados como documentos (JSON), gráficos ou pares de chave-valor. São excelentes para lidar com grandes volumes de dados não estruturados e para aplicações que precisam de alta escalabilidade ou flexibilidade.

### **O que é SQL?**
---

A Linguagem de consulta estruturada (SQL) é uma linguagem de programação para armazenar e processar informações em um banco de dados relacional. Um banco de dados relacional armazena informações em formato tabular, com linhas e colunas representando diferentes atributos de dados e as várias relações entre os valores dos dados. Você pode usar instruções SQL para armazenar, atualizar, remover, pesquisar e recuperar informações do banco de dados. Também pode usar SQL para manter e otimizar a performance do banco de dados.

Analistas e desenvolvedores de dados aprendem e utilizam a SQL porque ela se integra bem a diferentes linguagens de programação. Por exemplo, eles podem incorporar consultas SQL com a linguagem de programação Java para criar aplicações de processamento de dados de alta performance com os principais sistemas de banco de dados SQL, como Oracle ou MS SQL Server. A SQL também é bastante fácil de aprender, pois usa palavras-chave comuns em inglês em suas instruções.

### **Quais são os componentes de um sistema SQL?**
---

#### **Tabela SQL**

Uma tabela SQL é o elemento básico de um banco de dados relacional e consiste em linhas e colunas. Engenheiros de banco de dados criam relacionamentos entre várias tabelas de banco de dados para otimizar o espaço de armazenamento de dados.

#### **Instruções SQL**

Instruções SQL, ou consultas SQL, são instruções válidas que os sistemas de gerenciamento de banco de dados relacional compreendem. Os desenvolvedores de software criam instruções SQL usando diferentes elementos da linguagem. Elementos da linguagem SQL são componentes como identificadores, variáveis e condições de pesquisa que formam uma instrução correta.

#### **Procedimentos armazenados**

Procedimentos armazenados são uma coleção de uma ou mais instruções SQL armazenadas no banco de dados relacional. Os desenvolvedores de software usam procedimentos armazenados para melhorar a eficiência e a performance. Por exemplo, eles podem criar um procedimento armazenado para atualizar tabelas de vendas em vez de escrever a mesma instrução SQL em aplicações diferentes.

### **Possíveis Aplicações no projeto**
---

Um **exemplo** de implementação do banco de dados do projeto, ele pode ser divido em 3 funções: 

- **Guardar as notícias:** Salvar o texto das notícias que foram coletadas por meio do web scraping.
- **Anotar o "Onde" e o "Quanto":** Para cada notícia, o banco vai guardar a localização e outros dados chaves que a Inteligência Artificial reservou.
- **Enviar ao mapa:** Quando o usuário abrir o site, o banco de dados entrega rapidamente as informações para que o mapa mostre os pontos perigosos na tela.

O **PostgreSQL** é um dos SGDB que mais se enquadra nessas funções, com a extensão PostGIS, ele possui geometria preparada para mapas e fazer calculus de proximidade entre pontos etc. Ele tem uma biblioteca imensa com compatibilidade com python e tecnologias de web scrapping, como JSONB e SQLAlchemy, além de suportar grandes quantidades e variedades de dados.

#### Links de estudo:

 https://aws.amazon.com/pt/what-is/sql/ 
https://www.devmedia.com.br/conceitos-fundamentais-de-banco-de-dados/1649
Doc PostgreSQL: https://www.postgresql.org/docs/
Cheat Sheet PostgreSQL: https://gist.github.com/Kartones/dd3ff5ec5ea238d4c546
Doc PostGIS: https://postgis.net/documentation/

