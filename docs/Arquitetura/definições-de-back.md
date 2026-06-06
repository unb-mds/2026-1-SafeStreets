# 📄 Definição Oficial da Stack Back-end — SafeStreets

## 📌 Objetivo
Este documento tem como finalidade formalizar a escolha da stack de desenvolvimento back-end do projeto SafeStreets, justificando tecnicamente as tecnologias selecionadas para atender aos requisitos funcionais, arquiteturais e de inteligência artificial presentes no sistema.

> **Cross-references**: [CONTEXT.md](./CONTEXT.md) · [API-Contract.md](./API-Contract.md) · [ADRs-PENDENTES.md](./ADRs-PENDENTES.md) · [definir-fluxo-de-dados.md](./definir-fluxo-de-dados.md)

---

# 🚀 Stack Back-end Definida

## 🔹 Linguagem Principal
- Python

## 🔹 Framework Back-end
- FastAPI

## 🔹 Banco de Dados
- PostgreSQL

## 🔹 ORM
- SQLAlchemy

## 🔹 Documentação da API
- Swagger / OpenAPI

## 🔹 Containerização
- Docker

---

# 🧠 Justificativa da Escolha do FastAPI

A equipe definiu a utilização do FastAPI como framework principal do back-end devido às necessidades técnicas do SafeStreets, especialmente relacionadas às funcionalidades envolvendo Inteligência Artificial, classificação de dados e geração de resumos automáticos.

O FastAPI apresenta vantagens significativas para projetos modernos orientados a APIs REST e integração com modelos de IA.

---

# ✅ Motivos da Escolha

## 1. Excelente integração com Inteligência Artificial

O ecossistema Python é atualmente o principal ambiente para desenvolvimento de soluções de IA e Machine Learning.

O FastAPI permite integração direta com bibliotecas como:

- Transformers
- Scikit-learn
- TensorFlow
- PyTorch
- spaCy
- OpenAI SDK

Isso facilita a implementação de:
- classificação automática
- análise textual
- sumarização
- processamento de linguagem natural (NLP)

---

## 2. Alta Performance

O FastAPI possui alta performance graças ao uso do ASGI e Starlette, sendo comparável a frameworks modernos desenvolvidos em outras linguagens.

Isso garante:
- maior velocidade de resposta
- melhor concorrência
- eficiência em APIs modernas

---

## 3. Documentação Automática

O framework gera automaticamente documentação interativa utilizando:
- Swagger UI
- OpenAPI

Isso facilita:
- testes da API
- manutenção
- integração entre front-end e back-end
- entendimento das rotas pela equipe

---

## 4. Arquitetura Moderna

O FastAPI incentiva boas práticas de:
- modularização
- tipagem forte
- separação de responsabilidades
- organização de código

Facilitando:
- manutenção
- escalabilidade
- trabalho em equipe
- evolução do sistema

---

## 5. Facilidade de Desenvolvimento

A sintaxe do Python combinada com o FastAPI permite:
- desenvolvimento rápido
- menor complexidade
- maior produtividade da equipe

Isso é especialmente importante em projetos acadêmicos e colaborativos.

---

## 6. Padrões de Resilience (Adicionados na Refinação de Arquitetura)

O backend implementa padrões críticos para produção:

- **Rate Limiter**: Proteção contra quotas de API externa
- **Retry Exponencial**: 1s → 2s → 4s → 8s em falhas transitórias
- **Circuit Breaker**: Proteção contra API indisponível por > 5 minutos
- **Timeout**: 30 segundos máximo por requisição externa
- **Cache Distribuído**: PostgreSQL (principal) + Redis/in-memory (TTL 24h)

Referência: [definir-fluxo-de-dados.md - Resilience Patterns](./definir-fluxo-de-dados.md#resilience-patterns-aplicados)

---

## 7. Estratégia de Fallback para Integrações Externas

### Google Gemini (Sumarização)
- **Falha Temporária**: Retry com backoff exponencial
- **Falha Permanente**: Circuit breaker abre; resposta com `resumo_status="FALLBACK_GENERICO"` ou `"PENDENTE"`
- **Detalhes**: [ADR-001: Gemini Fallback Strategy](./ADR-001-Gemini-Fallback-Strategy.md)

### Feed RSS (Portal de Notícia Correio Braziliense)
- **Rate Limiting**: Rate limiter + fila de requisições para evitar sobrecarga
- **Indisponibilidade**: Circuit breaker + feeds cacheados (stale)
- **Timeout**: 30 segundos máximo por requisição; falência após
- **Parser RSS**: Extração robusta de título, descrição, link, data de publicação

---

## 8. Decisões Arquiteturais Pendentes

Seguintes decisões devem ser finalizadas antes de implementação completa:

| ADR | Tópico | Questão | Status |
|-----|--------|---------|--------|
| [ADR-001](./ADR-001-Gemini-Fallback-Strategy.md) | Gemini Fallback | Comportamento exato em falha? | ⏳ Pendente |
| [ADR-002](./ADRs-PENDENTES.md) | Cache TTL | Fixo 24h ou variável? | ⏳ Pendente |
| [ADR-003](./ADRs-PENDENTES.md) | Redis | Obrigatório ou opcional? | ⏳ Pendente |
| [ADR-004](./ADRs-PENDENTES.md) | Schema Versioning | Backward compat automática? | ⏳ Pendente |

Consulte [ADRs-PENDENTES.md](./ADRs-PENDENTES.md) para detalhes.
