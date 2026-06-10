# Tasks — Feature 001: Página inicial estática + navegação

> Referências: `spec.md`, `plan.md`, `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`
> `[P]` = pode rodar em paralelo (não depende de outra tarefa em andamento).
> Antes de cada mudança, o agente revisita spec.md e plan.md.

## Fase 0 — Setup
- [ ] T001 Inicializar projeto Next.js + TypeScript — raiz do repo
- [ ] T002 Configurar fontes (Schibsted Grotesk, Plus Jakarta Sans, JetBrains Mono) via `next/font/google` — `app/layout.tsx`
- [ ] T003 Definir design tokens + reset (cores oficiais, tipografia) — `app/globals.css`
- [ ] T004 [P] Copiar o logo para `public/logo-original.png`

## Fase 1 — Camada de dados (RF01)
- [ ] T005 Criar tipo `Noticia` e as 6 notícias de exemplo do protótipo — `data/noticias.ts`

## Fase 2 — Primitivas visuais
- [ ] T006 [P] Ícones SVG (Menu, Search, Close, Home, Map, Info, Pin, ArrowRight) — `components/icons/index.tsx`
- [ ] T007 [P] Componente `Logo` (escudo + marca "SafeStreets") — `components/Logo/Logo.tsx`

## Fase 3 — Barra superior e menu (RF03)
- [ ] T008 Componente `Header` (barra clara: hambúrguer + Logo + campo de busca visual) — `components/Header/Header.tsx` (+ `.module.css`) (depende: T006, T007)
- [ ] T009 Componente `Drawer` (painel lateral + backdrop; itens Início / Mapa de risco / Sobre nós, com ícone, seta e estado ativo; rodapé) — `components/Drawer/Drawer.tsx` (+ `.module.css`) (depende: T006, T007)
- [ ] T010 Componente `Chrome` ("use client": estado abrir/fechar do drawer; monta Header + Drawer + children + Footer) — `components/Chrome/Chrome.tsx` (+ `.module.css`) (depende: T008, T009, T013)
- [ ] T011 [P] Componente `Footer` — `components/Footer/Footer.tsx` (+ `.module.css`)

## Fase 4 — Conteúdo da home (RF01)
- [ ] T012 Componente `Hero` (eyebrow + título + subtítulo) — `components/Hero/Hero.tsx` (+ `.module.css`)
- [ ] T013 Componente `NewsCard` (placeholder de imagem, badge de região, data, título, descrição, fonte, link "Ler notícia →" inerte) — `components/NewsCard/NewsCard.tsx` (+ `.module.css`) (depende: T006)
- [ ] T014 Componente `NewsFeed` (título "Notícias" + contador + lista de `NewsCard`) — `components/NewsFeed/NewsFeed.tsx` (+ `.module.css`) (depende: T013)

## Fase 5 — Layout e rotas (RF03)
- [ ] T015 Layout raiz envolvendo `children` com `<Chrome>` — `app/layout.tsx` (depende: T010)
- [ ] T016 Página inicial: `Hero` + `NewsFeed` com os dados mock — `app/page.tsx` (depende: T005, T012, T014, T015)
- [ ] T017 [P] Página placeholder do mapa ("Mapa de risco — Em breve") — `app/mapa/page.tsx` (depende: T015)
- [ ] T018 [P] Página "Sobre nós" com texto do projeto — `app/sobre/page.tsx` (depende: T015)

## Fase 6 — Ajuste fino visual
- [ ] T019 Conferir aderência ao protótipo: cores (#016d01 / #f8c311), tipografia, cards, hero, drawer e estado ativo (depende: T016–T018)

## Critérios de pronto (Definition of Done)
- A rota `/` mostra barra superior, hero, seção "Notícias" e o feed de cards com dados de exemplo.
- O hambúrguer abre o drawer pela esquerda; itens navegam entre `/`, `/mapa` e `/sobre`,
  fecham o drawer e marcam a página atual como ativa.
- O drawer também fecha pelo X e pelo backdrop.
- Visual fiel ao protótipo, dentro da paleta `#016d01` / `#f8c311` / `#ffffff`.
- Busca e "Ler notícia →" presentes mas inertes; nenhuma chamada de rede, nenhum backend.