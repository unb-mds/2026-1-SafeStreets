# Spec — Feature 004: Resultados de Busca, Card Resumo e Detalhes da Ocorrência

> O **quê** e o **porquê**. Sem detalhes de implementação (isso vai no PLAN).
> Referência obrigatória: `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`
> Referência visual: protótipo de alta fidelidade do SafeStreets (mapa de risco com
> painel "FILTROS", lista de resultados, card resumo sobre o pin e tela "Ver
> detalhes").
> Depende de: `Specs_dashboard_busca` (painel de filtros, RF06/RF08).

## Problema
O painel "FILTROS" da rota `/mapa` já permite escolher Região Administrativa,
Período e digitar uma busca, mas nada acontece com esses critérios: nenhuma lista
de resultados é exibida, não há feedback quando a busca não encontra nada, o mapa
nunca exibe marcadores e não existe um card resumo nem uma tela de detalhes com
resumo gerado por IA.

## Objetivos desta entrega
- [ ] Ao aplicar busca/filtros no painel "FILTROS", exibir abaixo da barra de busca
      a lista de notícias correspondentes.
- [ ] Caso nenhuma notícia atenda aos critérios, exibir a mensagem "Nenhum
      resultado encontrado" no lugar da lista.
- [ ] Ao selecionar uma notícia da lista de resultados, posicionar um marcador
      (pin) no mapa na localização da ocorrência e exibir, acima do pin, um card
      resumo pequeno (risco, título, RA-XXXXX, localização, data — sem resumo de
      IA).
- [ ] No card resumo, disponibilizar a opção "Ver detalhes", que abre uma nova tela
      com as especificações completas da ocorrência e um resumo gerado por IA
      (com estados de carregamento e indisponibilidade).

## Requisitos cobertos
- **RF07 — Feedback de Busca Vazia:** o sistema deve exibir a mensagem "Nenhum
  resultado encontrado" caso os filtros/busca aplicados não encontrem nenhuma
  ocorrência.
- **RF10 — Card Resumo da Ocorrência:** ao selecionar uma notícia na lista de
  resultados, o sistema deve posicionar um marcador (pin) no mapa e exibir, acima
  dele, um card resumo contendo risco, título, número identificador (RA-XXXXX),
  localização exata e data — sem o resumo de IA.
- **RF11 — Gerar Resumo de IA:** ao clicar em "Ver detalhes" no card resumo, o
  sistema deve abrir uma nova tela com as especificações completas da ocorrência e
  um resumo gerado por IA.

## User Stories
- **US 3.3.1 (conclusão)** — exibição da lista de notícias correspondente aos
  filtros/busca aplicados.
- **US 3.3.2** — mensagem "Nenhum resultado encontrado".
- **US 3.3.5** — card resumo (pin + card pequeno) ao selecionar uma notícia da
  lista de resultados.
- **US 3.3.6** — opção "Ver detalhes" no card resumo, abrindo tela com resumo de
  IA, incluindo estados de carregamento e indisponibilidade.

## Layout de referência (protótipo)
- A lista de resultados aparece abaixo do campo "Buscar" do painel "FILTROS",
  como uma lista vertical de itens compactos (título da notícia, RA-XXXXX e
  localização), dentro do mesmo card branco do painel.
- Quando não há resultados, o espaço da lista exibe o texto "Nenhum resultado
  encontrado".
- O card resumo é pequeno, com borda verde (`#016d01`), exibido sobre o mapa,
  acima do pin correspondente. Contém: badge de risco, título da notícia,
  RA-XXXXX, localização e data, e o link "Ver detalhes" no rodapé.
- A tela de detalhes ("Ver detalhes") é uma nova rota que exibe título, RA-XXXXX,
  localização, data, nível de risco e o resumo gerado por IA (com indicador de
  carregamento enquanto o resumo não está disponível).

## Critérios de aceitação

### RF06/US 3.3.1 — Lista de resultados
- **Dado** que o usuário seleciona uma Região Administrativa, um Período e/ou
  digita um texto no campo "Buscar", **então** o sistema deve exibir, abaixo do
  campo "Buscar", a lista de notícias que atendem a todos os critérios
  preenchidos (interseção).
- **Dado** que nenhum filtro/busca foi aplicado (estado inicial), **então** a área
  de resultados deve permanecer vazia (sem lista e sem mensagem de "Nenhum
  resultado encontrado").

### RF07/US 3.3.2 — Busca vazia
- **Dado** que o usuário aplicou ao menos um filtro/busca e nenhuma notícia atende
  aos critérios, **então** o sistema deve exibir a mensagem "Nenhum resultado
  encontrado" no lugar da lista.
- **Dado** que a mensagem "Nenhum resultado encontrado" está sendo exibida e o
  usuário altera os filtros/busca para critérios que retornam resultados,
  **então** a mensagem deve desaparecer e a lista correspondente deve ser exibida.

### RF10/US 3.3.5 — Card resumo e pin
- **Dado** que o usuário clica em uma notícia da lista de resultados, **então** o
  sistema deve posicionar um marcador (pin) no mapa na localização da ocorrência.
- **Dado** que o marcador é posicionado, **então** o sistema deve exibir, acima do
  pin, um card resumo pequeno contendo: nível de risco, título, número
  identificador (RA-XXXXX), localização exata e data da ocorrência.
- **Dado** que o card resumo é exibido, **então** ele **não** deve conter o resumo
  gerado por IA.
- **Dado** que o usuário seleciona outra notícia da lista, **então** o pin e o
  card resumo devem ser atualizados para a nova ocorrência.

### RF11/US 3.3.6 — Ver detalhes e resumo de IA
- **Dado** que o card resumo está sendo exibido, **então** deve haver uma opção
  "Ver detalhes" visível no card.
- **Dado** que o usuário clica em "Ver detalhes", **então** o sistema deve abrir
  uma nova tela contendo as especificações completas da notícia (título, número
  identificador, localização, data e risco).
- **Dado** que a tela de detalhes é exibida, **então** o sistema deve apresentar
  um resumo gerado por inteligência artificial referente à ocorrência selecionada.
- **Dado** que o resumo de IA está sendo carregado, **então** o sistema deve
  indicar visualmente o estado de carregamento até que o conteúdo esteja
  disponível.
- **Dado** que não seja possível gerar o resumo de IA para a ocorrência
  selecionada, **então** o sistema deve exibir uma mensagem informando a
  indisponibilidade do resumo.

## Fora de escopo (NÃO fazer agora)
- Painel de produtividade com gráficos (RF09).
- Combinação real com dados de uma API (camada de dados continua mockada).
- Responsividade mobile.
- Integração real com um provedor de IA (o "resumo de IA" é simulado/mockado nesta
  entrega, isolado em uma camada de dados própria para facilitar a troca futura).
