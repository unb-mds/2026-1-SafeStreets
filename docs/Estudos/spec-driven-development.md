# Spec-Driven Development com IA

Um guia completo sobre o que são specs, como funcionam e como usar IA para desenvolver software com mais qualidade e menos retrabalho.

---

## O que é uma spec?

Uma *spec* (specification) é um documento que descreve um sistema, funcionalidade ou módulo com precisão suficiente para que outra pessoa — ou uma IA — possa implementá-lo sem ter que adivinhar nada.

A diferença entre uma spec e uma documentação comum é o nível de comprometimento: uma spec descreve o *contrato* do que será construído, antes de construir. É um ato de design, não de registro.

> **Analogia simples:** uma planta de arquitetura é uma spec. O engenheiro que constrói o prédio não precisa perguntar nada — tudo está especificado: medidas, materiais, localização. Specs de software seguem a mesma lógica.

---

## Por que usar specs no desenvolvimento?

| Sem spec | Com spec |
|---|---|
| Decisões tomadas no momento do código | Decisões tomadas antes, com calma |
| A equipe implementa interpretações diferentes | Todos partem do mesmo contrato |
| Bugs por suposição errada | Comportamentos esperados documentados |
| Retrabalho frequente | Menos iterações, mais precisão |
| IA gera código genérico | IA gera código alinhado ao seu projeto |

---

## Os 3 níveis de spec

### Nível 1 — Project Spec

Descreve o sistema como um todo: stack, arquitetura, decisões técnicas e o porquê de cada uma. É o documento que qualquer pessoa nova no projeto lê primeiro.

Responde à pergunta: *"o que é esse sistema e como ele funciona em alto nível?"*

### Nível 2 — Feature Spec

Descreve uma funcionalidade específica: entradas, saídas, regras de negócio, dependências e critérios de aceite.

Responde à pergunta: *"o que exatamente essa feature precisa fazer?"*

### Nível 3 — Module Spec

Descreve um módulo ou componente de código: funções públicas, contratos de entrada/saída, comportamentos esperados e o que *não* é responsabilidade desse módulo. É o mais granular e o mais útil para a IA gerar código correto.

---

## Anatomia de uma Feature Spec

Uma Feature Spec bem escrita tem estas seções:

```
## Feature: [nome da funcionalidade]

### Objetivo
O que essa feature entrega para o usuário ou sistema.

### Entradas
- O que o sistema recebe como dado de entrada
- Formatos e tipos esperados

### Saídas esperadas
- O que o sistema deve produzir
- Estrutura dos dados de retorno

### Regras de negócio
- Regras que não estão implícitas no enunciado
- Casos de borda que precisam de tratamento

### Dependências
- Outros módulos, APIs ou serviços que essa feature usa

### O que está fora do escopo
- O que explicitamente NÃO é responsabilidade desta feature

### Critérios de aceite
- [ ] Lista de comportamentos verificáveis
- [ ] Cada item deve ser testável
```

---

## Anatomia de um Module Spec

```
## Módulo: [nome do arquivo ou componente]

### Responsabilidade
Uma frase descrevendo o único propósito desse módulo.

### Interface pública
- nomeDoMetodo(param: Tipo) -> RetornoTipo
  - Entrada: descrição do parâmetro
  - Saída: descrição do retorno

### Comportamentos esperados
- O que acontece em cada cenário possível
- Como erros são tratados
- Limites e garantias

### O que NÃO é responsabilidade deste módulo
- Clareza sobre fronteiras é tão importante quanto
  descrever o que o módulo faz
```

---

## Como usar IA com specs

O ponto central do Spec-Driven Development com IA é simples: em vez de *perguntar* para a IA como fazer algo, você *instrui* a IA a implementar uma spec que você escreveu. A qualidade do output muda completamente.

### Fluxo de trabalho

1. **Escreva a spec** antes de abrir o chat com a IA. Isso força você a pensar no design antes do código.
2. **Forneça contexto do projeto** junto com a spec — stack, padrões de código, convenções que a IA deve seguir.
3. **Instrua, não pergunte.** "Implemente a spec abaixo" gera resultado melhor do que "como eu faria isso?".
4. **Revise contra a spec**, não contra sua intuição. A spec é o critério de aceite.
5. **Itere na spec** quando o requisito mudar — não no código diretamente. Spec primeiro, código depois.

### Prompts que funcionam bem

**Para implementar:**
> "Aqui está a spec do módulo X [cola a spec]. Aqui está o contexto da stack [cola o project spec]. Implemente seguindo exatamente a spec."

**Para revisar:**
> "Aqui está a spec [cola] e aqui está minha implementação [cola código]. Aponte o que está fora da spec e o que pode melhorar."

**Para gerar testes:**
> "Com base nessa spec [cola], escreva testes cobrindo todos os critérios de aceite."

**Para evoluir:**
> "A spec atual [cola] precisa suportar também [novo requisito]. Atualize a spec e depois implemente a mudança."

**Para detectar ambiguidade:**
> "Leia esta spec [cola] e liste tudo que está ambíguo ou que precisaria de uma decisão antes de implementar."

---

## Erros comuns ao escrever specs

| Erro | Problema | Correção |
|---|---|---|
| Spec muito vaga | A IA preenche lacunas com suposições | Descreva comportamentos específicos e casos de borda |
| Spec como documentação pós-fato | Perde o benefício de design antecipado | Escreva a spec antes de codificar |
| Não definir o que está fora do escopo | Módulos ficam com responsabilidades demais | Sempre inclua a seção "O que não é responsabilidade" |
| Critérios de aceite não testáveis | "Funcionar bem" não é um critério | Use critérios verificáveis e binários (sim/não) |
| Spec nunca atualizada | Código e spec ficam dessincronizados | Trate a spec como código: versionada e revisada |

---

## Como organizar specs no projeto

```
docs/
└── specs/
    ├── project-spec.md          # visão geral do sistema
    ├── features/
    │   ├── autenticacao.md
    │   ├── notificacoes.md
    │   └── relatorios.md
    └── modules/
        ├── auth-service.md
        ├── email-sender.md
        └── report-generator.md
```

> **Dica:** mantenha as specs no mesmo repositório do código. Isso garante que elas passem por code review, fiquem versionadas com o Git e sejam atualizadas junto com as mudanças no sistema.

---

## Spec-Driven vs outras abordagens

| Abordagem | Quando usar | Limitação |
|---|---|---|
| Spec-Driven | Projetos estruturados, equipes, uso intenso de IA | Exige disciplina para manter specs atualizadas |
| TDD | Quando os comportamentos são bem definidos | Testes não substituem design de arquitetura |
| BDD | Quando o negócio precisa validar o comportamento | Verbosidade pode ser obstáculo em times pequenos |
| Ad hoc | Prototipagem rápida, projetos solo | Não escala, gera retrabalho com o tempo |