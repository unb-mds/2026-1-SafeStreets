# Web Scraping “Raspagem de Dados”

### 🛠️ Principais Ferramentas

A linguagem de programação mais popular para Web Scraping é o **Python**, devido à sua facilidade e às suas excelentes bibliotecas:

- **BeautifulSoup:** Excelente para projetos simples. Ela ajuda a "navegar" no HTML e extrair textos e links facilmente.
- **Selenium:** Usado quando o site é "dinâmico" (construído com muito JavaScript, como as redes sociais, onde você precisa rolar a página para carregar mais itens). O Selenium literalmente abre um navegador invisível e simula cliques humanos.
- **Scrapy:** Um framework poderoso para projetos complexos e em grande escala, capaz de raspar milhares de páginas por minuto.

Vídeo com exemplo rápido sobre essa “Raspagem de Dados”: 

https://youtu.be/EdGjoNMdrA4?si=XDpWd29_l98yVnVh

**Web Scraping** (ou "raspagem de dados da web") é o processo automatizado de extração de dados de sites. Em vez de um humano abrir um navegador, copiar e colar informações em uma planilha, um script de computador (um "bot" ou "scraper") faz isso de forma muito mais rápida e em grande escala.

A internet está cheia de informações valiosas, mas elas geralmente estão formatadas em código HTML, feito para ser lido por navegadores (como Chrome ou Safari) e exibido visualmente. O Web Scraping "lê" esse código por trás da página e extrai apenas os dados puros que você deseja.

O processo geralmente segue quatro etapas básicas:

1. **Requisição (Request):** O scraper envia uma solicitação HTTP para a URL do site alvo, fingindo ser um navegador.
2. **Resposta (Response):** O servidor do site responde enviando o conteúdo da página, geralmente em formato HTML.
3. **Análise e Extração (Parsing):** O scraper analisa esse código HTML. Usando "caminhos" específicos (como tags CSS ou XPath), ele localiza e extrai exatamente os dados desejados (ex: o preço de um produto, o título de uma notícia).
4. **Armazenamento:** Os dados extraídos são limpos e salvos em um formato estruturado, como uma planilha Excel (CSV), um arquivo JSON ou um banco de dados, para serem analisados posteriormente.
