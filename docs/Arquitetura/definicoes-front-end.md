#  Stack Front-end – SafeStreets

Este documento define as tecnologias utilizadas no desenvolvimento do front-end do **SafeStreets**, bem como as justificativas para cada escolha. O foco é garantir um sistema **moderno, escalável e de fácil manutenção**, sem adicionar complexidade desnecessária.
> **Cross-references**: [CONTEXT.md](./CONTEXT.md) · [API-Contract.md](./API-Contract.md) · [definições-de-back.md](./definições-de-back.md)
---

##  Framework Principal: Next.js

**Definição:**
Framework baseado em React que oferece estrutura pronta para aplicações web modernas.

**Por que utilizar:**

* Renderização otimizada (SSR e SSG)
* Melhor performance e SEO
* Estrutura de projeto organizada
* Suporte nativo a rotas
* Otimizações automáticas (imagens, carregamento)

---

##  Linguagem: TypeScript + JSX

**Definição:**
O projeto utiliza TypeScript para lógica e tipagem, juntamente com JSX, uma sintaxe que permite escrever estruturas semelhantes a HTML diretamente no código.

**Por que utilizar:**

* Redução de erros em tempo de desenvolvimento
* Melhor organização do código
* Facilita manutenção e escalabilidade
* Integração direta com Next.js
* Permite construir interfaces de forma declarativa usando JSX

---

##  Estilização: CSS 

**Definição:**
Uso de CSS tradicional com escopo local através de CSS Modules (suportado nativamente pelo Next.js).

**Por que utilizar:**

* Escopo local evita conflitos de classes
* Código mais organizado e previsível
* Fácil manutenção e refatoração
* Sem dependência de frameworks de estilo

---

##  Boas Práticas Utilizadas

* Componentização da interface
* Separação de responsabilidades
* Código limpo e reutilizável
* Tratamento de erros e feedback visual

---
##  Integração com Backend: Mapeamento Ocorrência → Notícia

O frontend consome dados via API REST e **monta a estrutura de Notícia** para o usuário:

- **Ocorrência** (backend): Abstração interna com campos técnicos (latitude, longitude precisas, tipo_crime, etc)
- **Notícia** (frontend): Apresentação enriquecida para o usuário (título, resumo IA, localização aproximada, RA)

Detalhes de mapeamento: [API-Contract.md - Modelo: Notícia](./API-Contract.md#2-modelo-notícia-montagem-no-frontend)

---

##  Tratamento de Estados de Dados

O frontend trata os seguintes estados de resumo gerado por IA:

```typescript
type ResumoStatus = "completo" | "pendente" | "erro" | "fallback_generico";

// "completo": Resumo vindo do Google Gemini
// "pendente": Resumo em processamento (retry assíncrono)
// "erro": Falha permanente; card mostra aviso
// "fallback_generico": Resumo padrão quando Gemini indisponível
```

Referência: [ADR-001: Gemini Fallback Strategy](./ADR-001-Gemini-Fallback-Strategy.md#opção-d-circuit-breaker--fallback-híbrido)

---

##  Padrão Jamstack

O projeto adota **Jamstack** (JavaScript, APIs, Markup):

- **Frontend**: Next.js (SSR/SSG quando possível)
- **API**: FastAPI REST (consumida via HTTPS)
- **Markup**: JSX tipado + CSS Modules

**Vantagem**: Separação completa; frontend é agnóstico a implementação do backend. Facilita testes, deploy independente, escalabilidade.

---
Links relacionados: 

https://www.youtube.com/watch?v=fX5WCe3d8WU

https://www.youtube.com/watch?v=QsSUbuYeEFk

https://www.youtube.com/watch?v=sW-yibnl1tQ
