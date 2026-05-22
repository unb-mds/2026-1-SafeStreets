## Issue: [Estudo] Docker e Containerização para Ambientes de Desenvolvimento

Descrição:
Este estudo foca no aprendizado de Docker para padronizar o ambiente de desenvolvimento do nosso Squad. O objetivo principal é acabar com o clássico problema do "na minha máquina funciona", garantindo que o crawler e a IA de classificação rodem exatamente da mesma forma no computador de todo mundo e no GitHub Actions.
### 1. O que é o Docker (e por que usar em MDS?)

Diferente de uma Máquina Virtual, o Docker compartilha o kernel do sistema operacional, o que o torna muito mais leve. Para o nosso projeto, ele serve para "empacotar" todas as dependências (Python, bibliotecas de NLP, ferramentas de scraping) em uma Imagem única.
### 2. Conceitos Chave

    Dockerfile: É a "receita do bolo". Um arquivo de texto onde a gente escreve o passo a passo para montar o ambiente (instalar o Python, copiar o código, rodar o pip install).

    Imagem: É o pacote estático (o "bolo pronto" antes de ser comido).

    Container: É a imagem em execução (o processo rodando).

    Docker Compose: Ferramenta para rodar múltiplos containers. Vai ser útil se a gente precisar de um banco de dados e da API de coleta rodando juntos.

### 3. Comandos Essenciais para o Dia a Dia

Aqui estão os comandos que eu testei e que o grupo vai precisar:

    docker build -t nome-do-projeto . -> Cria a imagem a partir do Dockerfile.

    docker run -p 8080:80 nome-do-projeto -> Sobe o container (mapeando a porta).

    docker ps -> Lista os containers que estão rodando agora.

    docker stop [ID_do_container] -> Para a execução.

    docker system prune -> Limpa o lixo (imagens e containers parados) pra não encher o HD.

    docker-compose up -> Sobe todo o ambiente definido no arquivo compose.

### 4. Integração com o nosso Pipeline

Como o projeto segue a arquitetura de APIs -> Coleta -> Classificação , o Docker vai permitir que o nosso script de coleta (GitHub Actions) rode dentro de um ambiente controlado, evitando erros de versão de biblioteca de IA ou de drivers de scraping.
### Referências Consultadas (Links Diretos)

    Docker Docs: Orientation and Setup - https://docs.docker.com/get-started/

    DigitalOcean: Como instalar e usar o Docker (Guia Prático) - [https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04]

    Alura Blog: O que é Docker e como começar - [https://www.alura.com.br/artigos/comecando-com-docker]
