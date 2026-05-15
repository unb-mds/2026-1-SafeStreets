# [DOCS] Estudo Técnico: Fundamentos e Implementação de FastAPI

##  📋 Descrição

Esta issue tem como objetivo documentar o estudo técnico sobre o framework `FastAPI`, detalhando sua arquitetura assíncrona, validação de dados e integração no projeto **SafeStreets**. O objetivo é capacitar os membros do backend na criação de rotas performáticas e garantir a padronização das respostas da API utilizando `Pydantic` e `Uvicorn`.

---

##  ✅ Tarefas

- [x] Documentar os fundamentos do `FastAPI` e seus diferenciais técnicos.
- [ ] Implementar a estrutura modular utilizando `APIRouter`.
- [ ] Validar modelos de dados com `Pydantic` para a extração de crimes.
- [ ] Configurar e testar a documentação automática (`/docs`).
- [ ] Integrar testes unitários com `TestClient` para as novas rotas.

---

##  🔗 Contexto Adicional

###  1. Fundamentos Técnicos
O `FastAPI` é construído sobre o `Starlette` (web) e o `Pydantic` (dados). Sua principal vantagem é o uso de `Type Hints` para automação de tarefas.

*   **Desempenho:** Suporte nativo a `async/await`, permitindo alta concorrência.
*   **Segurança:** Validação rigorosa que reduz erros humanos em tempo de execução.
*   **Documentação:** Geração automática de interfaces `Swagger UI` e `ReDoc`.

###  2. Exemplo Prático de Implementação
Abaixo, a estrutura básica de uma rota funcional conforme já estabelecido no projeto:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API está rodando!"}
```

Ao receber uma chamada no endpoint `/health`, o framework processa a função assíncrona e converte o retorno em `JSON` automaticamente. A validação ocorre em tempo real, e o desenvolvedor pode testar a rota diretamente via `/docs`.

###  3. Aplicação no SafeStreets
*   **Modularidade:** Uso de `APIRouter` para separar lógicas de negócio.
*   **Docker:** Execução sobre `Uvicorn` em ambiente isolado para evitar conflitos de dependências.
*   **IA:** Preparação da arquitetura para receber chamadas não-bloqueantes da API do `Gemini`.

###  📌 Referências
*   [PR #26 - Setup Backend](https://github.com/unb-mds/2026-1-SafeStreets/pull/26) — Configuração inicial e rotas.
*   [requirements.txt](https://github.com/unb-mds/2026-1-SafeStreets/blob/main/backend/requirements.txt) — Dependências do servidor.
*   [Guia de Infraestrutura](https://claude.ai/share/a3ef942c-6d89-451a-a521-cfdc1905607a) — Arquitetura de Sistemas com `FastAPI` e `Docker`.
