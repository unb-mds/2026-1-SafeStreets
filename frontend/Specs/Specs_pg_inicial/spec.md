# Spec — Feature 001: Página inicial + navegação

> O **quê** e o **porquê**. Sem detalhes de implementação (isso vai no PLAN).
> Referência obrigatória: `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`
> Referência visual: protótipo de alta fidelidade do SafeStreets (telas: página inicial + menu).
>
> **Status:** entregue. Esta spec foi atualizada após a implementação para refletir
> o estado real da feature (campo de busca funcional, cards sem imagem e sem fonte,
> "Sobre nós" como link externo).

## Problema
O cidadão do DF não tem um lugar único e claro para se informar sobre ocorrências
de segurança na sua região. O primeiro passo do SafeStreets é entregar a **porta de
entrada do produto** — uma página inicial informativa e a navegação principal — antes
de qualquer integração com dados reais.

## Objetivos desta entrega
- [x] Exibir uma página inicial com seção hero + feed de notícias de segurança (dados de exemplo/estáticos).
- [x] Disponibilizar um menu de navegação (drawer lateral) para "Início", "Mapa de risco" e "Sobre nós".
- [x] Permitir buscar/filtrar o feed de notícias pelo campo de busca da barra superior.
- [x] Aplicar a identidade visual do protótipo (logo, paleta, tipografia, cards).

## Requisitos cobertos
- **RF01 — Visualizar página de notícia:** a página inicial exibe um feed de notícias sobre segurança.
- **RF03 — Menu de navegação:** menu lateral com links diretos para "Início", "Mapa" e "Sobre nós".
- **RF08 — Busca de notícias:** o campo da barra superior filtra o feed da home pelo termo digitado.

## User Stories
- **US 1.1.1** — Como cidadão, quero acessar a página de informações sobre crimes na
  região do DF para me informar sobre a segurança.
- **US 1.1.3** — Como cidadão, quero ter acesso ao menu do website para me redirecionar
  a outros conteúdos.

## Layout de referência (protótipo)

### Barra superior (em todas as páginas, exceto sobre o mapa)
- Fundo **claro** (off-white), fixa no topo, com divisória inferior sutil.
- À esquerda: botão de menu (hambúrguer) + logo do escudo com a marca "SafeStreets"
  ("Safe" em verde-escuro, "Streets" em amarelo). O escudo usado é `public/logo-escudo.png`.
- À direita: campo de busca arredondado com ícone de lupa e placeholder
  "Buscar por região ou crime" — **funcional** (filtra o feed da home; ver RF08).

### Página inicial ("/")
- **Hero:** etiqueta superior em destaque ("SEGURANÇA EM TEMPO REAL · DF" com ícone de pin),
  título grande em verde-escuro "Sua região, mais segura e transparente." e um parágrafo
  de apoio sobre acompanhar ocorrências e nível de risco.
- **Seção "Notícias"** com um contador de itens.
- **Feed de cards.** Cada card contém, de cima para baixo:
  - Badge de **região** (pílula amarela com ícone de pin) + badge de **data** (cinza, dd/mm/aaaa).
  - **Título** em negrito.
  - **Descrição** breve.
  - Rodapé do card: link "Ler notícia →" (alinhado à direita).
  - *Sem* área de imagem e *sem* rótulo de fonte (removidos do card).

### Menu (drawer)
- Abre **pela esquerda** ao clicar no hambúrguer, sobre um fundo escurecido (backdrop).
- Topo: logo + botão de fechar (X).
- Rótulo "NAVEGAÇÃO" e os itens, cada um com ícone à esquerda, rótulo e seta "→":
  - **Início** → rota interna `/`.
  - **Mapa de risco** → rota interna `/mapa`.
  - **Sobre nós** → **link externo** para `https://unb-mds.github.io/2026-1-SafeStreets/`
    (abre em nova aba). Não é uma rota interna.
- O item correspondente à rota interna atual aparece destacado (estado ativo). O link
  externo "Sobre nós" nunca recebe estado ativo.
- Rodapé do drawer com um texto curto descrevendo o produto.

## Critérios de aceitação

### RF01 — Feed de notícias
- **Dado** que acesso "/", **quando** a página carrega, **então** vejo o hero, a seção
  "Notícias" e a lista de cards.
- Cada card exibe badge de região, data (dd/mm/aaaa), título e descrição — na disposição
  do protótipo, sem imagem e sem fonte.
- O conteúdo vem de dados estáticos de exemplo (sem chamada de rede nesta fase).
- A lista rola verticalmente quando há mais cards do que cabem na tela.

### RF03 — Menu de navegação
- **Dado** que estou em qualquer página, **quando** clico no hambúrguer, **então** o
  drawer abre pela esquerda mostrando "Início", "Mapa de risco" e "Sobre nós".
- **Quando** clico em "Início" ou "Mapa de risco", **então** sou levado à rota
  correspondente sem recarregar a aplicação (navegação client-side) e o drawer fecha.
- **Quando** clico em "Sobre nós", **então** o site institucional abre em nova aba e o
  drawer fecha.
- O drawer também fecha ao clicar no X ou no fundo escurecido.
- O item correspondente à rota interna atual aparece em estado ativo.

### RF08 — Busca de notícias
- **Dado** que estou em "/", **quando** digito um termo no campo de busca da barra
  superior, **então** o feed passa a mostrar apenas as notícias que correspondem ao termo.
- A correspondência considera o texto da notícia (título, resumo, região e fonte), é
  insensível a maiúsculas/minúsculas e a acentos (ex.: "ceilandia" encontra "Ceilândia").
- **Quando** nenhuma notícia corresponde, **então** vejo a mensagem
  "Nenhuma notícia encontrada para a sua busca.".
- **Quando** limpo o campo, **então** o feed volta a exibir todas as notícias.
- O campo de busca não aparece sobre a rota `/mapa`.

### Identidade visual
- Paleta restrita: verde `#016d01`, amarelo `#f8c311`, branco `#ffffff` + cinzas/off-white auxiliares.
- Tipografia do protótipo: Schibsted Grotesk (títulos), Plus Jakarta Sans (corpo), JetBrains Mono (rótulos/datas).
- Logo do escudo presente na barra superior e no topo do drawer.

## Fora de escopo (NÃO fazer agora)
- Qualquer backend, API ou banco de dados (a busca opera sobre os dados mockados).
- Página de detalhe da notícia: o link "Ler notícia →" aparece, mas fica **inerte**
  nesta fase (RF02 — fase posterior).
- Mapa interativo: a rota `/mapa` é entregue por outra feature (dashboard de busca),
  fora do escopo desta spec.
- Resumo de IA (RF14), badges de risco.
- Responsividade mobile.
