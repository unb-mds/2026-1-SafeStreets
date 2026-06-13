---
name: safestreets-implement-feature
description: Guia a implementação de uma feature do frontend SafeStreets seguindo Spec-Driven Development (spec.md/plan.md/tasks.md) e XP/TDD. Use quando solicitado a implementar uma feature, executar as tasks de uma spec, desenvolver um componente novo ou escrever os testes correspondentes.
---

# Implementação de Features (Spec-Driven + XP/TDD)

Este skill guia a implementação de uma feature do frontend SafeStreets a partir dos
documentos de uma pasta `frontend/Specs/Specs_<feature>/` (`constitution.md`,
`spec.md`, `plan.md`, `tasks.md`), seguindo Extreme Programming: entregas pequenas,
testes escritos junto com o código e refatoração contínua.

## Antes de começar
1. Leia `frontend/Specs/Specs_pg_inicial/constitution.md` — princípios não-negociáveis
   do projeto (paleta de cores, CSS Modules, TypeScript, componentização, separação
   de camadas, etc.). Toda implementação deve respeitar este documento.
2. Leia `spec.md` da feature — entenda o problema, os requisitos (RF) cobertos, as
   User Stories e, principalmente, os **critérios de aceitação**. Eles são a fonte
   da verdade para os testes.
3. Leia `plan.md` — estrutura de pastas, stack/dependências e decisões técnicas já
   definidas. Não improvise uma abordagem diferente sem atualizar o `plan.md`.
4. Leia `tasks.md` — lista ordenada de tarefas (T001, T002, ...) com dependências e
   marcação `[P]` para tarefas paralelas.

## Fluxo por tarefa (ciclo TDD: red → green → refactor)
Para cada tarefa de `tasks.md`, na ordem (respeitando dependências):

1. **Red** — escreva primeiro o(s) teste(s) do componente/função da tarefa em
   `frontend/__tests__/<categoria>/<Nome>.test.tsx`, cobrindo pelo menos:
   - um caso de fluxo esperado (happy path), derivado dos critérios de aceitação do
     `spec.md`;
   - um caso de borda/exceção (lista vazia, prop ausente, estado inicial, etc.).
   Rode os testes e confirme que falham (o componente ainda não existe/está incompleto).

2. **Green** — implemente o mínimo necessário em `components/`, `view/`, `app/`,
   `utils/` (conforme `plan.md`) para os testes passarem. Siga as convenções do
   projeto: TypeScript tipado, CSS Modules ao lado do componente, paleta
   `#016d01` / `#f8c311` / `#ffffff`.

3. **Refactor** — com os testes verdes, limpe duplicação, nomes e estrutura sem
   alterar comportamento. Rode os testes de novo para garantir que continuam
   passando.

4. **Marque a tarefa como concluída** (`- [x]`) em `tasks.md`.

5. **Commit** referenciando o requisito/tarefa, ex:
   `feat(RF05): renderiza mapa interativo centralizado no DF (T002)`.

## Executando os testes
Use a skill `safestreets-run-frontend-tests` para comandos, configuração do Jest e
armadilhas conhecidas (ex: mock de `next/navigation`, `next/image`, problemas com
`jsdom`). Resumo rápido:
```powershell
cd frontend
npx jest <caminho-do-teste>   # durante o desenvolvimento (TDD)
npm test                       # antes de marcar a fase como concluída
```

## Ao concluir todas as tarefas de uma fase/feature
- Confirme cada item da seção **"Critérios de pronto (Definition of Done)"** do
  `tasks.md` contra o app rodando (`npm run dev`) e contra a suíte de testes
  (`npm test`).
- Revise os **critérios de aceitação** do `spec.md` um a um — cada `Dado/Quando/Então`
  deve corresponder a um comportamento observável (manual ou via teste).
- Só então considere a feature pronta para revisão/PR.

## Regras gerais (reforço da constitution)
- Nada de frameworks de CSS além de CSS Modules.
- Sem `any` implícito em TypeScript.
- Componentes pequenos, com responsabilidade única — nada de páginas monolíticas.
- O frontend nunca acessa fontes de dados diretamente: passa por uma camada de
  dados isolada (`utils/`/`data/`), hoje mockada.
- Nenhuma chave de API ou credencial no código do frontend.
