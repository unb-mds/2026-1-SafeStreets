# Tasks — Feature 002: Mapa interativo

> Referências: `spec.md`, `plan.md`, `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`
> `[P]` = pode rodar em paralelo (não depende de outra tarefa em andamento).
> Antes de cada mudança, o agente revisita spec.md e plan.md.

## Fase 0 — Setup
- [x] T001 Adicionar dependências `leaflet`, `react-leaflet` e `@types/leaflet` —
  `frontend/package.json`

## Fase 1 — Mapa interativo (RF05)
- [x] T002 Componente `MapView` (`"use client"`): `MapContainer` + `TileLayer`
  (OpenStreetMap), centralizado no DF (`[-15.7797, -47.9297]`), `zoom: 11`, sem
  marcadores — `components/MapaInterativo/MapView.tsx` (depende: T001)
- [x] T003 Componente `MapaInterativo` (`"use client"`): `next/dynamic` (`ssr: false`)
  para `MapView`, container full-screen — `components/MapaInterativo/MapaInterativo.tsx`
  (+ `.module.css`) (depende: T002)

## Fase 2 — Layout full-screen e overlay do Chrome
- [x] T004 Atualizar `view/Mapa/Mapa.tsx` para renderizar `<MapaInterativo />` em
  tela cheia, removendo o conteúdo placeholder — `view/Mapa/Mapa.tsx` (+ `.module.css`)
  (depende: T003)
- [x] T005 Atualizar `Chrome` para detectar a rota `/mapa` (`usePathname`) e aplicar
  variante "overlay": oculta `Footer`, posiciona `Header`/`Drawer` sobrepostos ao
  mapa sem faixa de fundo separando-os — `components/Chrome/Chrome.tsx`
  (+ `.module.css`) (depende: T004)

## Fase 3 — Testes
- [x] T006 [P] Teste do `MapaInterativo`/`MapView` com mock de `react-leaflet`,
  garantindo renderização sem erro em `jsdom` — `__tests__/components/MapaInterativo.test.tsx`
  (depende: T003)
- [x] T007 [P] Teste do `Chrome` cobrindo a variante overlay na rota `/mapa`
  (sem `Footer`, `Header`/`Drawer` sobrepostos) — `__tests__/components/Chrome.test.tsx`
  (depende: T005)

## Critérios de pronto (Definition of Done)
- A rota `/mapa` renderiza um mapa interativo real (Leaflet/OpenStreetMap),
  ocupando 100% da viewport, sem necessidade de ação do usuário.
- O mapa carrega centralizado no DF (`-15.7797, -47.9297`) com zoom padrão (`11`).
- O usuário consegue arrastar (pan) e dar zoom in/out livremente.
- Nenhum marcador/pin é exibido por padrão ao acessar `/mapa` pelo menu.
- `Header` e `Drawer` aparecem sobrepostos ao mapa, sem faixa de fundo separando-os;
  o `Footer` não é exibido na rota `/mapa`.
- Testes novos/atualizados passam (`npm test`).
