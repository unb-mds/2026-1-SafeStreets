# Spec — Feature 001: Página inicial estática + navegação

> O **quê** e o **porquê**. Sem detalhes de implementação (isso vai no PLAN).
> Referência obrigatória: `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`
> Referência visual: protótipo de alta fidelidade do SafeStreets (telas: página inicial + menu).

## Problema
O cidadão do DF não tem um lugar único e claro para se informar sobre ocorrências
de segurança na sua região. O primeiro passo do SafeStreets é entregar a **porta de
entrada do produto** — uma página inicial informativa e a navegação principal — antes
de qualquer integração com dados reais.

## Objetivos desta entrega
- [ ] Exibir uma página inicial com seção hero + feed de notícias de segurança (dados de exemplo/estáticos).
- [ ] Disponibilizar um menu de navegação (drawer lateral) para "Início", "Mapa de risco" e "Sobre nós".
- [ ] Aplicar a identidade visual do protótipo (logo, paleta, tipografia, cards).

## Requisitos cobertos
- **RF01 — Visualizar página de notícia:** a página inicial exibe um feed de notícias sobre segurança.
- **RF03 — Menu de navegação:** menu lateral com links diretos para "Início", "Mapa" e "Sobre nós".

## User Stories
- **US 1.1.1** — Como cidadão, quero acessar a página de informações sobre crimes na
  região do DF para me informar sobre a segurança.
- **US 1.1.3** — Como cidadão, quero ter acesso ao menu do website para me redirecionar
  a outros conteúdos.

## Layout de referência (protótipo)

### Barra superior (em todas as páginas)
- Fundo **claro** (off-white), fixa no topo, com divisória inferior sutil.
- À esquerda: botão de menu (hambúrguer) + logo do escudo com a marca "SafeStreets"
  ("Safe" em verde-escuro, "Streets" em amarelo). O logo está localizado em `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\imagens\logo-original.png`
- À direita: campo de busca arredondado com ícone de lupa e placeholder
  "Buscar" (**apenas visual nesta fase**).

### Página inicial ("/")
- **Hero:** etiqueta superior em destaque ("SEGURANÇA EM TEMPO REAL · DF" com ícone de pin),
  título grande em verde-escuro "Sua região, mais segura e transparente." e um parágrafo
  de apoio sobre acompanhar ocorrências e nível de risco.
- **Seção "Notícias"**.
- **Feed de cards.** Cada card contém, de cima para baixo:
  - Área de imagem (por enquanto um *placeholder* com textura listrada e rótulo
    "[ imagem · {região} ]"; sem imagem real nesta fase).
  - Badge de **região** (pílula amarela com ícone de pin) + badge de **data** (cinza, dd/mm/aaaa).
  - **Título** em negrito.
  - **Descrição** breve.
  - Rodapé do card: **fonte** (ex.: "Boletim de Segurança · SSP-DF") + link "Ler notícia →".

### Menu (drawer)
- Abre **pela esquerda** ao clicar no hambúrguer, sobre um fundo escurecido (backdrop).
- Topo: logo + botão de fechar (X).
- Rótulo "NAVEGAÇÃO" e os itens, cada um com ícone à esquerda, rótulo e seta "→":
  "Início", "Mapa de risco", "Sobre nós". O item da página atual aparece destacado (estado ativo).
- Rodapé do drawer com um texto curto descrevendo o produto.

## Critérios de aceitação

### RF01 — Feed de notícias
- **Dado** que acesso "/", **quando** a página carrega, **então** vejo o hero, a seção
  "Notícias" e a lista de cards.
- Cada card exibe placeholder de imagem, badge de região, data (dd/mm/aaaa), título,
  descrição e fonte — na disposição do protótipo.
- O conteúdo vem de dados estáticos de exemplo (sem chamada de rede nesta fase).
- A lista rola verticalmente quando há mais cards do que cabem na tela.

### RF03 — Menu de navegação
- **Dado** que estou em qualquer página, **quando** clico no hambúrguer, **então** o
  drawer abre pela esquerda mostrando "Início", "Mapa de risco" e "Sobre nós".
- **Quando** clico em um item, **então** sou levado à rota correspondente sem recarregar
  a aplicação (navegação client-side) e o drawer fecha.
- O drawer também fecha ao clicar no X ou no fundo escurecido.
- O item correspondente à página atual aparece em estado ativo.

### Identidade visual
- Paleta restrita: verde `#016d01`, amarelo `#f8c311`, branco `#ffffff` + cinzas/off-white auxiliares.
- Tipografia do protótipo: Schibsted Grotesk (títulos), Plus Jakarta Sans (corpo), JetBrains Mono (rótulos/datas).
- Logo do escudo presente na barra superior e no topo do drawer.

## Fora de escopo (NÃO fazer agora)
- Qualquer backend, API ou banco de dados.
- Busca funcional (o campo aparece, mas não filtra) — RF08, fase posterior.
- Mapa interativo funcional: a rota `/mapa` é só um *placeholder* estático ("Em breve").
- Página de detalhe da notícia: o link "Ler notícia →" aparece, mas fica **inerte**
  nesta fase (RF02 — fase posterior).
- Resumo de IA (RF14), filtros (RF06+), badges de risco e dashboard de busca.
- Responsividade mobile.