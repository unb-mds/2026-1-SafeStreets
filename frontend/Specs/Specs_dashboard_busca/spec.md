# Spec — Feature 003: Dashboard de Busca — Painel de Filtros

> O **quê** e o **porquê**. Sem detalhes de implementação (isso vai no PLAN).
> Referência obrigatória: `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`
> Referência visual: protótipo de alta fidelidade do SafeStreets (tela: Mapa de
> risco com painel "FILTROS" sobreposto).

## Problema
A rota `/mapa` hoje exibe apenas o mapa interativo, sem nenhuma forma de o
cidadão refinar o que está vendo. O Épico 3 (Dashboard de Busca/Filtros) prevê
um menu lateral de filtros por Região Administrativa e Período, com opção de
"Limpar filtros" — ainda ausente na interface.

## Objetivos desta entrega
- [x] Adicionar, na rota `/mapa`, um painel "FILTROS" sobreposto ao mapa (canto
      superior direito), seguindo o protótipo de alta fidelidade.
- [x] Disponibilizar um seletor de "Região Administrativa" com opção placeholder
      "Escolha uma opção" e a lista de RAs conhecidas.
- [x] Disponibilizar um seletor de "Período" com opção placeholder
      "Escolha uma opção" e opções de intervalo de tempo.
- [x] Disponibilizar um campo "Buscar" com ícone de lupa.
- [x] Disponibilizar o botão "Limpar filtros", que reseta os dois seletores e o
      campo de busca para o estado inicial.

## Requisitos cobertos
- **RF06 — Filtro de Ocorrências (parcial — UI):** o sistema deve disponibilizar
  um menu lateral de filtros que permita ao usuário refinar os pontos exibidos
  no mapa por Região Administrativa e Período/Data. Nesta entrega os campos de
  filtro existem e são funcionais como controles de UI (estado local); a
  aplicação do filtro sobre marcadores reais é tratada em entrega futura, pois
  o mapa ainda não exibe marcadores/ocorrências (ver `Specs_mapa_interativo`).
- **RF08 — Limpeza de Filtros:** o sistema deve fornecer uma opção "Limpar
  filtros" que remove os filtros aplicados (região, período e busca).

## User Stories
- **US 3.3.1 (parcial)** — Como cidadão, quero buscar notícias de monitoramento
  urbano por região administrativa (RA) e ter a opção de filtrar por intervalos
  de tempo. *(Esta entrega cobre os campos/seletores; a aplicação efetiva do
  filtro aos resultados é entrega futura.)*
- **US 3.3.3** — Como cidadão, quero que tenha uma opção de limpar filtros.

## Layout de referência (protótipo)
- Na rota `/mapa`, sobreposto ao mapa, no canto superior direito, aparece um
  card branco com cantos arredondados e título "FILTROS" (em destaque, com um
  botão circular amarelo de recolher/expandir ao lado).
- Abaixo do título: campo "Região Administrativa" (label + seletor com texto
  "Escolha uma opção" e seta indicadora) e campo "Período" (mesmo padrão).
- Uma linha divisória separa os filtros dos controles inferiores.
- Botão "Limpar filtros" em largura total, estilo neutro/outline.
- Campo "Buscar" em largura total, fundo levemente acinzentado, com ícone de
  lupa à direita.
- O painel fica posicionado abaixo do `Header` overlay, sem cobrir o
  menu/logo, e não ocupa a tela inteira — apenas a área de filtros no canto
  superior direito do mapa.

## Critérios de aceitação

### RF06 — Campos de filtro (US 3.3.1, parcial)
- **Dado** que o usuário acessa a rota `/mapa`, **então** o painel "FILTROS"
  deve estar visível, sobreposto ao mapa, sem necessidade de nenhuma ação
  adicional.
- **Dado** que o painel "FILTROS" está visível, **então** deve haver um campo
  "Região Administrativa" com um seletor cujo valor inicial é "Escolha uma
  opção" e que lista as Regiões Administrativas conhecidas (Ex: Ceilândia,
  Taguatinga).
- **Dado** que o painel "FILTROS" está visível, **então** deve haver um campo
  "Período" com um seletor cujo valor inicial é "Escolha uma opção" e que lista
  opções de intervalo de tempo.
- **Dado** que o usuário seleciona uma Região Administrativa e/ou um Período,
  **então** o seletor correspondente deve refletir o valor escolhido.
- **Dado** que o painel "FILTROS" está visível, **então** deve haver um campo
  "Buscar" com ícone de lupa, no qual o usuário pode digitar texto livre.

### RF08 — Limpar filtros (US 3.3.3)
- **Dado** que o usuário possui Região Administrativa, Período e/ou texto de
  busca preenchidos, **então** deve haver um botão "Limpar filtros" visível no
  painel.
- **Dado** que o usuário clica em "Limpar filtros", **então** o seletor de
  Região Administrativa, o seletor de Período e o campo "Buscar" devem voltar
  ao estado inicial ("Escolha uma opção" / vazio).

### Recolher/expandir painel (aderência ao protótipo — RNF05)
- **Dado** que o painel "FILTROS" está expandido (estado inicial), **quando** o
  usuário clica no botão circular ao lado do título, **então** o corpo do
  painel (campos de filtro, "Limpar filtros" e "Buscar") deve ser ocultado,
  mantendo apenas o cabeçalho "FILTROS" visível.
- **Dado** que o painel está recolhido, **quando** o usuário clica novamente no
  botão, **então** o corpo do painel volta a ser exibido.

## Fora de escopo (NÃO fazer agora)
- Aplicação real dos filtros sobre marcadores/ocorrências no mapa (não há
  marcadores ainda) e sobre uma lista de notícias do dashboard (RF06 completo).
- Mensagem "Nenhum resultado encontrado" (RF07).
- Combinação/interseção de filtros e atualização automática do dashboard
  (US 3.3.1 completa, US 3.3.4).
- Painel de produtividade com gráficos (RF09).
- Card resumo de ocorrência / "Ver detalhes" (RF10, US 3.3.5, US 3.3.6).
- Resumo gerado por IA (RF11).
- Responsividade mobile.
