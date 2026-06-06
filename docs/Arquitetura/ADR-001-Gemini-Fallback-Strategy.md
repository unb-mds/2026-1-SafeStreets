# ADR-001: Estratégia de Fallback para Google Gemini API

## Status
🔴 **PENDING** — Requer decisão da equipe

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

**Opção D: Circuit Breaker + Fallback Híbrido**

- **Justificativa**: Sistema crítico de segurança pública merece máxima resiliência
- **Implementação**: 
  1. Primeira falha: retry com backoff 1s → 2s → 4s
  2. Após 3 falhas ou timeout > 5min: circuit breaker abre
  3. Enquanto aberto: resumo genérico (Opção C) + log warning
  4. Quando circuit fecha: tenta Gemini novamente

## Decisão Final
⏳ **Pendente** — Aguardando consenso da equipe de arquitetura

### Critério de Aceição
- [ ] Equipe de backend concordou com padrão
- [ ] UX/Product validou comportamento degradado
- [ ] Implementação em models.py + services.py incluída
- [ ] Testes Pytest cobrindo todos os 4 caminhos

## Referências
- [definir-fluxo-de-dados.md#4-processamento-por-ia](./definir-fluxo-de-dados.md#4-processamento-por-ia)
- [CONTEXT.md#fallback-strategy-gemini](./CONTEXT.md#fallback-strategy-gemini)
