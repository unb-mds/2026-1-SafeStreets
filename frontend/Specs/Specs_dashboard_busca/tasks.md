# Tasks — Feature 003: Dashboard de Busca — Painel de Filtros

> Referências: `spec.md`, `plan.md`, `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`
> `[P]` = pode rodar em paralelo (não depende de outra tarefa em andamento).
> Antes de cada mudança, o agente revisita spec.md e plan.md.

## Fase 0 — Camada de dados
- [x] T001 [P] Criar `utils/filtros.ts` com `REGIOES_ADMINISTRATIVAS` (derivado
  de `utils/noticias.ts`, sem duplicatas, ordenado) e `PERIODOS` (opções
  estáticas) — `frontend/utils/filtros.ts`
- [x] T002 [P] Teste de `utils/filtros.ts`: `REGIOES_ADMINISTRATIVAS` contém
  regiões conhecidas sem duplicatas; `PERIODOS` não vazio, com `value`/`label`
  — `frontend/__tests__/utils/filtros.test.ts` (depende: T001)

## Fase 1 — Ícone novo
- [x] T003 [P] Adicionar `ChevronDownIcon` em `components/icons/index.tsx`,
  seguindo o padrão dos ícones existentes — `frontend/components/icons/index.tsx`
- [x] T004 [P] Teste de `ChevronDownIcon` em `__tests__/components/icons.test.tsx`
  (depende: T003)

## Fase 2 — Componente `PainelFiltros` (RF06 + RF08)
- [x] T005 Teste do componente `PainelFiltros` cobrindo: renderização do
  título "FILTROS", labels "Região Administrativa"/"Período" com placeholder
  "Escolha uma opção", botão "Limpar filtros" e campo "Buscar"; seleção de
  região/período; digitação na busca; "Limpar filtros" reseta tudo; toggle de
  recolher/expandir — `frontend/__tests__/components/PainelFiltros.test.tsx`
  (depende: T001, T003) — escrever ANTES da implementação (red)
- [x] T006 Implementar `PainelFiltros.tsx` (`"use client"`, estado local:
  `regiao`, `periodo`, `busca`, `expandido`) + `PainelFiltros.module.css`
  (paleta `#016d01`/`#f8c311`/`#ffffff`, layout conforme protótipo) —
  `frontend/components/PainelFiltros/PainelFiltros.tsx` (+ `.module.css`)
  (depende: T005)

## Fase 3 — Integração na rota `/mapa`
- [x] T007 Atualizar `view/Mapa/Mapa.tsx` para renderizar `<PainelFiltros />`
  como overlay sobre `<MapaInterativo />`; ajustar `Mapa.module.css`
  (`position: relative`) — `frontend/view/Mapa/Mapa.tsx` (+ `.module.css`)
  (depende: T006)

## Critérios de pronto (Definition of Done)
- A rota `/mapa` exibe o painel "FILTROS" sobreposto ao mapa, no canto superior
  direito, sem ação adicional do usuário.
- O painel tem seletor "Região Administrativa" (placeholder "Escolha uma
  opção" + opções de RAs conhecidas) e seletor "Período" (placeholder
  "Escolha uma opção" + opções de intervalo de tempo).
- O painel tem campo "Buscar" com ícone de lupa e botão "Limpar filtros".
- "Limpar filtros" reseta região, período e busca ao estado inicial.
- O botão circular do cabeçalho recolhe/expande o corpo do painel.
- Nenhuma lógica de filtragem de marcadores/notícias é exigida nesta entrega.
- Testes novos/atualizados passam (`npm test`).
