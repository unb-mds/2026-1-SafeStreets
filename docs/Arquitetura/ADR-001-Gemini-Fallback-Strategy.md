# ADR-001: Estratégia de Fallback para Google Gemini API

## Status
🟢 **ACEITO** — Opção A (decidido pela equipe em 2026-06-17)

## Contexto

O sistema utiliza Google Gemini para gerar resumos concisos de ocorrências criminais. A API Gemini pode falhar por:
- Timeout (30s limite)
- Rate limiting (quota excedida)
- Indisponibilidade (erro 5xx)
- Erro permanente (invalid input)

**Pergunta**: Como o sistema deve se comportar quando Gemini falha?

## Opções Consideradas

### Opção A: Retorna Notícia sem Resumo Imediatamente
- **Implementação**: Card mostra titulo, data, localização, mas resumo aparece vazio/"Indisponível"
- **Prós**: UX rápida; usuário vê informação básica; sem delay
- **Contras**: Informação incompleta; necessário campo visual "resumo pending" no DB
- **Impacto**: Baixo custo; UX degradada

### Opção B: Enfileira para Retry Assíncrono
- **Implementação**: Ocorrência persistida sem resumo; worker assíncrono tenta novamente a cada 1h
- **Prós**: Eventualmente consistente; resumo aparece após alguns minutos
- **Contras**: Card inicialmente vazio; requer job queue (ex: Celery, RQ); lógica mais complexa
- **Impacto**: Médio custo; UX melhor eventualmente; operacional mais complexo

### Opção C: Usa Resumo Genérico Padrão
- **Implementação**: Se Gemini falha, usa template: "Crime de [TIPO] registrado em [LOCAL] em [DATA]"
- **Prós**: Card sempre completo; sem delay; simples
- **Contras**: Menos informativo; perde valor da IA; false sense of completeness
- **Impacto**: Baixo custo; UX consistente; valor de IA perdido

### Opção D: Circuit Breaker + Fallback Híbrido
- **Implementação**: 
  - Gemini fails < 3x: retry com backoff exponencial
  - Gemini fails > 3x ou timeout > 5min: circuit breaker abre
  - Circuit aberto: Opção C (resumo genérico) ou Opção A (vazio)
- **Prós**: Resiliência máxima; comportamento gradual; protege backend
- **Contras**: Implementação mais complexa; requer monitoring
- **Impacto**: Alto custo inicial; melhor em produção; mais observabilidade

## Recomendação (Proposta)

> ⚠️ **Histórico**: esta era a proposta inicial. A equipe optou pela **Opção A**
> (ver [Decisão Final](#decisão-final)). A Opção D fica registrada como possível
> evolução futura quando o volume/escala justificar o custo de circuit breaker.

**Opção D: Circuit Breaker + Fallback Híbrido**

- **Justificativa**: Sistema crítico de segurança pública merece máxima resiliência
- **Implementação**: 
  1. Primeira falha: retry com backoff 1s → 2s → 4s
  2. Após 3 falhas ou timeout > 5min: circuit breaker abre
  3. Enquanto aberto: resumo genérico (Opção C) + log warning
  4. Quando circuit fecha: tenta Gemini novamente

## Decisão Final

✅ **Opção A — Retorna Notícia sem Resumo Imediatamente** (equipe, 2026-06-17)

Quando o Gemini falhar (timeout, rate limit, 5xx ou input inválido), o sistema
**não bloqueia** a entrega da ocorrência: persiste e exibe o card com título,
data e localização, e o resumo aparece como indisponível.

### Justificativa
- **Simplicidade e custo**: não exige job queue (Celery/RQ) nem circuit breaker
  — escopo adequado ao estágio atual do projeto.
- **UX sem delay**: o usuário vê a informação básica imediatamente; o sistema
  nunca trava esperando a IA.
- A resiliência maior (Opção D) fica como evolução futura, sem reescrever o
  fluxo — basta trocar o comportamento de fallback.

### Consequências para a implementação
- O campo `resumo_status` registra o estado: `COMPLETO` quando o Gemini
  responde; `ERRO` quando falha (resumo fica nulo/"Indisponível").
- O campo `resumo` (resumo_gemini) é **nullable** — pode ficar vazio.
- **Sem** retry assíncrono e **sem** resumo genérico: a falha é refletida no
  status, não mascarada.
- Frontend deve tratar `resumo_status = "ERRO"` exibindo "Resumo indisponível".

### Critério de Aceitação
- [x] Equipe concordou com o padrão (2026-06-17)
- [ ] Implementação em `models/` + `services/` (camada de integração Gemini)
- [ ] Testes Pytest cobrindo os caminhos: sucesso (`COMPLETO`) e falha (`ERRO`)
- [ ] Frontend trata `resumo_status = "ERRO"`

## Referências
- [definir-fluxo-de-dados.md#4-processamento-por-ia](./definir-fluxo-de-dados.md#4-processamento-por-ia)
- [CONTEXT.md#fallback-strategy-gemini](./CONTEXT.md#fallback-strategy-gemini)
