# Tasks — Feature 001: Página inicial + navegação

> Referências: `spec.md`, `plan.md`, `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`
> `[P]` = pode rodar em paralelo (não depende de outra tarefa em andamento).
> Antes de cada mudança, o agente revisita spec.md e plan.md.
>
> Os caminhos refletem a **estrutura final** (`view/`, `style/`, `utils/`, `app/` fino).
> As Fases 0–6 entregaram a versão estática inicial; as Fases 7–9 cobrem os ajustes
> feitos depois sobre o protótipo (reestruturação, navegação externa, cards e busca).

## Fase 0 — Setup
- [x] T001 Inicializar projeto Next.js + TypeScript — `frontend/`
- [x] T002 Configurar fontes (Schibsted Grotesk, Plus Jakarta Sans, JetBrains Mono) via `next/font/google` — `app/layout.tsx`
- [x] T003 Definir design tokens + reset (cores oficiais, tipografia) — `style/globals.css`
- [x] T004 [P] Copiar o logo do escudo para `public/logo-escudo.png`

## Fase 1 — Camada de dados (RF01)
- [x] T005 Criar tipo `Noticia` e as 6 notícias de exemplo do protótipo — `utils/noticias.ts`

## Fase 2 — Primitivas visuais
- [x] T006 [P] Ícones SVG (Menu, Search, Close, Home, Map, Info, Pin, ArrowRight, ChevronDown) — `components/icons/index.tsx`
- [x] T007 [P] Componente `Logo` (escudo + marca "SafeStreets") — `components/Logo/Logo.tsx`

## Fase 3 — Barra superior e menu (RF03)
- [x] T008 Componente `Header` (barra clara: hambúrguer + Logo + campo de busca) — `components/Header/Header.tsx` (+ `.module.css`) (depende: T006, T007)
- [x] T009 Componente `Drawer` (painel + backdrop; itens Início / Mapa de risco / Sobre nós, com ícone, seta e estado ativo; rodapé) — `components/Drawer/Drawer.tsx` (+ `.module.css`) (depende: T006, T007)
- [x] T010 Componente `Chrome` ("use client": estado do drawer; monta Header + Drawer + children + Footer) — `components/Chrome/Chrome.tsx` (+ `.module.css`) (depende: T008, T009, T013)
- [x] T011 [P] Componente `Footer` — `components/Footer/Footer.tsx` (+ `.module.css`)

## Fase 4 — Conteúdo da home (RF01)
- [x] T012 Componente `Hero` (eyebrow + título + subtítulo) — `components/Hero/Hero.tsx` (+ `.module.css`)
- [x] T013 Componente `NewsCard` (badges de região e data, título, descrição, link "Ler notícia →") — `components/NewsCard/NewsCard.tsx` (+ `.module.css`) (depende: T006)
- [x] T014 Componente `NewsFeed` (título "Notícias" + contador + lista de `NewsCard`) — `components/NewsFeed/NewsFeed.tsx` (+ `.module.css`) (depende: T013)

## Fase 5 — Layout e rotas (RF03)
- [x] T015 Layout raiz envolvendo `children` com `<Chrome>` — `app/layout.tsx` (depende: T010)
- [x] T016 Página inicial: `view/Home` (`Hero` + `NewsFeed`) com os dados mock — `app/page.tsx` → `view/Home/Home.tsx` (depende: T005, T012, T014, T015)
- [x] T017 [P] Rota do mapa — `app/mapa/page.tsx` → `view/Mapa/Mapa.tsx` (conteúdo entregue pela feature dashboard de busca)

## Fase 6 — Ajuste fino visual
- [x] T018 Conferir aderência ao protótipo: cores (#016d01 / #f8c311), tipografia, cards, hero, drawer e estado ativo

## Fase 7 — Reestruturação de pastas (arquitetura do frontend)
- [x] T019 Mover dados mockados `data/noticias.ts` → `utils/noticias.ts` e atualizar imports
- [x] T020 Mover `app/globals.css` → `style/globals.css` e atualizar o import no `layout.tsx`
- [x] T021 Extrair conteúdo das páginas para `view/Home` e `view/Mapa`; manter `app/` como camada fina de roteamento

## Fase 8 — Navegação "Sobre nós" externa
- [x] T022 Transformar o item "Sobre nós" do `Drawer` em link externo (`https://unb-mds.github.io/2026-1-SafeStreets/`, nova aba) e remover a rota interna `/sobre`

## Fase 9 — Cards e busca funcional
- [x] T023 Remover a área de imagem do `NewsCard` (componente + CSS) — TDD: atualizar `NewsCard.test.tsx`
- [x] T024 Remover a fonte do rodapé do `NewsCard` (mantida no modelo `Noticia` e na busca) — TDD: atualizar `NewsCard.test.tsx`
- [x] T025 Criar filtro puro `filtrarNoticias` (case/acento-insensitive) — `utils/busca.ts` (+ `__tests__/utils/busca.test.ts`)
- [x] T026 Criar `SearchProvider` (contexto `query`/`setQuery` + hook `useSearch`) — `components/SearchProvider/SearchProvider.tsx` (+ teste)
- [x] T027 Tornar o campo de busca do `Header` um input controlado; `Chrome` lê o contexto e repassa por props; `layout` envolve com `<SearchProvider>` — TDD: atualizar `Header.test.tsx`
- [x] T028 `Home` filtra as notícias pelo termo e o `NewsFeed` exibe estado vazio — teste de integração `__tests__/view/Home.test.tsx`

## Critérios de pronto (Definition of Done)
- [x] A rota `/` mostra barra superior, hero, seção "Notícias" e o feed de cards com dados de exemplo.
- [x] Os cards exibem região, data, título e descrição — sem imagem e sem fonte.
- [x] O campo de busca filtra o feed por título/resumo/região/fonte (case/acento-insensitive),
      com mensagem de vazio quando nada corresponde; some na rota `/mapa`.
- [x] O hambúrguer abre o drawer pela esquerda; "Início" e "Mapa de risco" navegam client-side
      entre `/` e `/mapa`, fecham o drawer e marcam a rota atual como ativa.
- [x] "Sobre nós" abre o site institucional em nova aba e fecha o drawer.
- [x] O drawer também fecha pelo X e pelo backdrop.
- [x] Visual fiel ao protótipo, dentro da paleta `#016d01` / `#f8c311` / `#ffffff`.
- [x] "Ler notícia →" presente mas inerte; nenhuma chamada de rede, nenhum backend.
- [x] Suíte de testes (Jest + RTL) e `npm run build` passando.
