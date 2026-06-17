# Spec — Feature 002: Mapa interativo

> O **quê** e o **porquê**. Sem detalhes de implementação (isso vai no PLAN).
> Referência obrigatória: `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`
> Referência visual: protótipo de alta fidelidade do SafeStreets (tela: Mapa de risco).

## Problema
A rota `/mapa` hoje exibe apenas um placeholder estático ("Em breve"). O cidadão
precisa visualizar geograficamente o mapa do DF assim que acessa essa seção, sem
precisar de nenhuma ação adicional, para começar a explorar as áreas imediatamente.

## Objetivos desta entrega
- [x] Substituir o placeholder da rota `/mapa` por um mapa interativo real.
- [x] Carregar o mapa automaticamente ao acessar a página, centralizado no Distrito
      Federal com zoom padrão.
- [x] Permitir que o usuário explore o mapa livremente (arrastar/pan e zoom in/out).

## Requisitos cobertos
- **RF05 — Renderização do Mapa:** o sistema deve apresentar um mapa interativo
  integrado à interface principal. O mapa pode ser explorado e será carregado com
  zoom padrão centralizado no DF.

## User Stories
- **US 2.2.2** — Como cidadão, quero que o mapa interativo carregue ao acessar o
  sistema, já exibindo regiões do DF, para que eu possa começar a explorar as áreas
  imediatamente.

## Layout de referência (protótipo)
- Ao selecionar "Mapa" no menu, a rota `/mapa` exibe o mapa interativo **ocupando a
  tela inteira** (viewport completa), sem o `Footer` e sem áreas de conteúdo
  separadas por bordas/cards.
- A barra superior (`Header`) e o `Drawer` continuam disponíveis, porém **integrados
  visualmente ao mapa**: ficam sobrepostos (overlay) sobre o mapa, sem uma divisória
  ou faixa de fundo separando-os da área do mapa — o mapa preenche todo o espaço
  por trás/sob esses elementos.

## Critérios de aceitação

### RF05 — Renderização do mapa (US 2.2.2)
- **Dado** que o usuário acessa a rota `/mapa`, **quando** a página carrega,
  **então** o mapa interativo deve ser renderizado automaticamente, ocupando toda a
  tela, sem necessidade de nenhuma ação adicional do usuário.
- **Dado** que o mapa foi renderizado, **então** ele deve ser exibido com zoom
  padrão centralizado na região do Distrito Federal (lat/long aproximados:
  `-15.7797, -47.9297`).
- **Dado** que o mapa está carregado, **quando** o usuário arrasta o mapa ou usa os
  controles de zoom, **então** ele deve conseguir explorar livremente (pan e
  zoom in/out) as regiões exibidas, inclusive nas áreas cobertas pelo `Header`/`Drawer`.
- **Dado** que o usuário acessa o mapa diretamente pelo menu (sem ter feito nenhuma
  busca no dashboard de pesquisa), **então** o mapa deve carregar **sem
  marcadores/pins** — nenhuma ocorrência é exibida por padrão.

## Fora de escopo (NÃO fazer agora)
- Exibição de marcadores (pins) de ocorrências — estes só aparecem após uma busca no
  dashboard de pesquisa (RF06, Épico 3) e ao linkar uma notícia selecionada (RF04 —
  US 2.2.1), ambos em features futuras.
- Card resumo ao selecionar marcador/notícia (RF04 — US 2.2.1, próxima feature).
- Filtros por região administrativa e período (RF06+).
- Mensagem "Nenhum resultado encontrado" e limpeza de filtros (RF07, RF08).
- Resumo gerado por IA (RF11).
- Responsividade mobile.
