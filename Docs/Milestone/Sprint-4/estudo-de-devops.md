[DOCS] Pesquisa Técnica e Planejamento de CI/CD
## 📋 Descrição

Esta issue documenta o estudo sobre a implementação de um pipeline de CI/CD (Integração Contínua e Entrega Contínua) para o projeto SafeStreets. O foco é automatizar a validação do código Python/FastAPI e garantir que as novas funcionalidades, como a extração de dados via IA, não quebrem o sistema.

O pipeline visa transformar o fluxo de trabalho manual em um processo automatizado, desde o envio do código ao GitHub até a disponibilização em um ambiente de execução controlado.
## ✅ Tarefas

    [x] Documentar o fluxo de CI/CD para o Squad 01.

    [ ] Configurar GitHub Actions para rodar o pytest automaticamente em cada Push.

    [ ] Implementar validação de linting (Flake8 ou Black) para padronização do código.

    [ ] Configurar GitHub Secrets para gerenciar a GOOGLE_API_KEY de forma segura.

    [ ] Criar pipeline de Build para a imagem Docker do backend.

## 🔗 Contexto Adicional (Estudo Técnico)
### 1. Integração Contínua (CI) no SafeStreets

A Integração Contínua é a prática de mesclar o código dos desenvolvedores em um repositório compartilhado várias vezes ao dia para detectar erros precocemente.

    Pipeline de Testes: Utilizaremos o pytest e o httpx para validar endpoints críticos como o /health.

    Fail Fast: O pipeline será configurado para falhar imediatamente caso os testes unitários falhem, impedindo que bugs cheguem à branch main.

### 2. Entrega e Implantação Contínua (CD)

O CD automatiza a entrega do software em ambientes de teste ou produção após a fase de build.

    Docker: O uso de contêineres garante que o pipeline execute o software em um ambiente idêntico ao de desenvolvimento, eliminando conflitos de infraestrutura.

### 3. Segurança e Gerenciamento de Secrets

Para o funcionamento da extração de crimes, o projeto utiliza a chave de API do Gemini.

    GitHub Secrets: Nenhuma credencial ou chave (como a GOOGLE_API_KEY) deve ser escrita diretamente no código ou no pipeline.

    Proteção de Dados: Utilizaremos o recurso de Secrets do GitHub para injetar essas variáveis de forma segura apenas durante a execução do pipeline, mantendo a conformidade com o arquivo .gitignore já implementado no projeto.

## 📌 Referências Técnicas

    Arquitetura Miro/C4 — Diagramas de Containers e Componentes.

    PR #26 - Setup Backend — Estrutura inicial do FastAPI e Routers.

    Guia de Infraestrutura (Docker & FastAPI) — Roteiro prático de implementação do Squad.
