# Tasks — Feature 004: Resultados de Busca, Card Resumo e Detalhes da Ocorrência

> Referências: `spec.md`, `plan.md`, `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`
> `[P]` = pode rodar em paralelo (não depende de outra tarefa em andamento).
> Antes de cada mudança, o agente revisita spec.md e plan.md.

## Fase 0 — Camada de dados
- [ ] T001 [P] Estender `Noticia` em `utils/noticias.ts` com `risco: "Alto" |
  "Médio" | "Baixo"`, `lat: number`, `lng: number` (centróide aproximado de cada
  região) para os 6 itens mockados — `frontend/utils/noticias.ts`
- [ ] T002 Criar `algumFiltroAplicado` e `filtrarNoticias` em `utils/filtros.ts`
  (região, período por janela de dias a partir de `noticia.data`, busca livre em
  título/resumo/região, combinados por interseção) — `frontend/utils/filtros.ts`
  (depende: T001)
- [ ] T003 [P] Testes de `filtrarNoticias`/`algumFiltroAplicado`: região isolada,
  busca isolada, combinação região+busca, combinação sem resultados, período
  filtra fora da janela — `frontend/__tests__/utils/filtros.test.ts` (depende:
  T002) — escrever ANTES/junto da implementação (red→green)
- [ ] T004 [P] Criar `gerarResumoIA(noticia)` em `utils/iaResumo.ts`: mock
  assíncrono que resolve com string derivada de `noticia.resumo`/`titulo` para a
  maioria, e rejeita para `id === "5"` — `frontend/utils/iaResumo.ts` (depende:
  T001)
- [ ] T005 [P] Teste de `gerarResumoIA`: resolve para notícia comum; rejeita para
  `id "5"` — `frontend/__tests__/utils/iaResumo.test.ts` (depende: T004)

## Fase 1 — Componente `ResultadoBusca`
- [ ] T006 Teste de `ResultadoBusca`: renderiza título, `RA-XXXXX` e região;
  `onSelecionar` é chamado ao clicar; `aria-pressed` reflete prop `selecionado`
  — `frontend/__tests__/components/ResultadoBusca.test.tsx` (depende: T001) —
  escrever ANTES da implementação (red)
- [ ] T007 Implementar `ResultadoBusca.tsx` + `.module.css` (botão de lista,
  título/RA/região, `aria-pressed`) — `frontend/components/ResultadoBusca/`
  (depende: T006)

## Fase 2 — Componente `CardResumo` (RF10)
- [ ] T008 Teste de `CardResumo`: renderiza badge de risco, título, `RA-XXXXX`,
  região e data; link "Ver detalhes" aponta para `/ocorrencia/{id}`; **não**
  renderiza nenhum resumo de IA — `frontend/__tests__/components/CardResumo.test.tsx`
  (depende: T001) — escrever ANTES da implementação (red)
- [ ] T009 Implementar `CardResumo.tsx` + `.module.css` (badge de risco com cores
  Alto/Médio/Baixo, título, RA, localização, data, link "Ver detalhes" via
  `next/link`) — `frontend/components/CardResumo/` (depende: T008)

## Fase 3 — Lista de resultados e "Nenhum resultado encontrado" (RF06/RF07)
- [ ] T010 Estender teste de `PainelFiltros`: sem filtro/busca a área de
  resultados está vazia; com filtro sem correspondência exibe "Nenhum resultado
  encontrado"; com filtro com correspondência renderiza um `ResultadoBusca` por
  item e clique dispara `onSelecionarNoticia` — `frontend/__tests__/components/PainelFiltros.test.tsx`
  (depende: T002, T007) — escrever ANTES da implementação (red)
- [ ] T011 Atualizar `PainelFiltros.tsx`: prop `onSelecionarNoticia`, computa
  `resultados` via `filtrarNoticias`, renderiza lista/`ResultadoBusca` ou "Nenhum
  resultado encontrado" conforme `algumFiltroAplicado` — `frontend/components/PainelFiltros/PainelFiltros.tsx`
  (depende: T010)

## Fase 4 — Pin + Card Resumo no mapa (RF10)
- [ ] T012 Estender teste de `MapaInterativo`/`MapView` (mock de `react-leaflet`
  com `Marker`/`Popup`): sem `noticiaSelecionada` não renderiza marcador (mantém
  teste atual); com `noticiaSelecionada`, renderiza `Marker` na posição
  `[lat, lng]` e `Popup` contendo `CardResumo` — `frontend/__tests__/components/MapaInterativo.test.tsx`
  (depende: T009) — escrever ANTES da implementação (red)
- [ ] T013 Atualizar `MapaInterativo.tsx`/`MapView.tsx`: prop
  `noticiaSelecionada?: Noticia | null`, ícone de pin via `L.divIcon` (cores da
  paleta), `Marker` + `Popup` (sempre aberto) com `CardResumo` —
  `frontend/components/MapaInterativo/` (depende: T012)
- [ ] T014 Atualizar `view/Mapa/Mapa.tsx` para `"use client"`, estado
  `noticiaSelecionada`, conectar `PainelFiltros.onSelecionarNoticia` ↔
  `MapaInterativo.noticiaSelecionada` — `frontend/view/Mapa/Mapa.tsx` (depende:
  T011, T013)

## Fase 5 — Tela "Ver detalhes" + resumo de IA (RF11)
- [ ] T015 Teste de `OcorrenciaDetalhes`: estado inicial de carregamento; após
  resolver `gerarResumoIA`, exibe o resumo; para notícia `id "5"` (rejeição),
  exibe mensagem de indisponibilidade; exibe título/risco/RA/região/data —
  `frontend/__tests__/view/OcorrenciaDetalhes.test.tsx` (depende: T004) —
  escrever ANTES da implementação (red)
- [ ] T016 Implementar `view/OcorrenciaDetalhes/OcorrenciaDetalhes.tsx` +
  `.module.css` (`"use client"`, `useEffect`/`useState` chamando `gerarResumoIA`,
  estados loading/ready/error) — `frontend/view/OcorrenciaDetalhes/` (depende:
  T015)
- [ ] T017 Criar rota `app/ocorrencia/[id]/page.tsx`: busca notícia por `id` em
  `utils/noticias.ts`, `notFound()` se ausente, renderiza `OcorrenciaDetalhes` —
  `frontend/app/ocorrencia/[id]/page.tsx` (depende: T016)

## Critérios de pronto (Definition of Done)
- No painel "FILTROS", aplicar Região/Período/Busca exibe a lista de notícias
  correspondentes abaixo do campo "Buscar"; sem correspondência, exibe "Nenhum
  resultado encontrado"; sem filtro/busca, a área permanece vazia.
- Selecionar uma notícia da lista posiciona um pin no mapa e exibe, acima dele, um
  card resumo (risco, título, RA-XXXXX, localização, data) sem resumo de IA.
- O card resumo tem a opção "Ver detalhes", que abre `/ocorrencia/{id}` com as
  especificações completas e um resumo gerado por IA, com estados de
  carregamento e indisponibilidade.
- `npm test` passa integralmente.
