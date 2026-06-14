# Plano técnico — Feature 004: Resultados de Busca, Card Resumo e Detalhes da Ocorrência

> Blueprint técnico derivado de `spec.md`. Respeita `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`.

## Stack
- Next.js (App Router), TypeScript + JSX, CSS Modules. Sem dependências novas.
- `react-leaflet`/`leaflet` já usados em `MapaInterativo`/`MapView`.
- Estado de seleção (`noticiaSelecionada`) elevado para `view/Mapa/Mapa.tsx`
  (passa a ser `"use client"`), compartilhado entre `PainelFiltros` e
  `MapaInterativo`.

## Estrutura de pastas (incrementos sobre a estrutura atual)
```
frontend/
  utils/
    noticias.ts            # + campos risco, lat, lng em Noticia
    filtros.ts              # + FiltrosBusca, filtrarNoticias, algumFiltroAplicado
    iaResumo.ts              # novo: gerarResumoIA (mock assíncrono)
  components/
    PainelFiltros/
      PainelFiltros.tsx      # + lista de resultados / "Nenhum resultado encontrado"
    ResultadoBusca/
      ResultadoBusca.tsx      # novo: item clicável da lista de resultados
      ResultadoBusca.module.css
    CardResumo/
      CardResumo.tsx          # novo: card pequeno (risco, título, RA, local, data, "Ver detalhes")
      CardResumo.module.css
    MapaInterativo/
      MapaInterativo.tsx      # + prop noticiaSelecionada
      MapView.tsx              # + Marker/Popup com CardResumo
  view/
    Mapa/
      Mapa.tsx                 # "use client" — estado noticiaSelecionada
    OcorrenciaDetalhes/
      OcorrenciaDetalhes.tsx   # novo: tela "Ver detalhes" (resumo de IA)
      OcorrenciaDetalhes.module.css
  app/
    ocorrencia/
      [id]/
        page.tsx               # novo: rota de detalhes
```

## Camada de dados

### `utils/noticias.ts`
- `Noticia` ganha:
  - `risco: "Alto" | "Médio" | "Baixo"`
  - `lat: number`, `lng: number` (centróide aproximado da região, para o pin).
- Dados mockados existentes recebem valores plausíveis para os 6 itens.

### `utils/filtros.ts`
- `export type FiltrosBusca = { regiao: string; periodo: string; busca: string }`
- `export function algumFiltroAplicado(filtros: FiltrosBusca): boolean` — `true` se
  `regiao`, `periodo` ou `busca` (trim) for não vazio.
- `export function filtrarNoticias(noticias: Noticia[], filtros: FiltrosBusca): Noticia[]`
  - Filtra por `regiao` (igualdade exata, se preenchido).
  - Filtra por `periodo` (`7d`/`30d`/`3m`/`1y`): compara `noticia.data`
    (`dd/mm/yyyy`) com a data atual (`new Date()`), aceitando notícias dentro da
    janela em dias (7/30/90/365).
  - Filtra por `busca` (texto livre, case-insensitive): `titulo`, `resumo` ou
    `regiao` contém o texto.
  - Critérios combinados por interseção (AND).

### `utils/iaResumo.ts`
- `export async function gerarResumoIA(noticia: Noticia): Promise<string>`
  - Simula latência (`setTimeout`/`Promise`, ~600ms).
  - Para a notícia de id `"5"`, rejeita (`throw new Error(...)`), simulando
    indisponibilidade do resumo — usado para cobrir o critério de aceitação de
    "resumo indisponível".
  - Para as demais, resolve com uma string de resumo derivada de
    `noticia.resumo`/`noticia.titulo` (mock determinístico, sem chamada de API
    real — mantém RNF07/segredos fora do frontend).

## Componentes

### `ResultadoBusca` (`components/ResultadoBusca/`)
- Props: `noticia: Noticia`, `selecionado: boolean`, `onSelecionar: () => void`.
- `<button>` (lista = `<ul>`/`<li>` no `PainelFiltros`) exibindo título, `RA-XXXXX`
  (campo `noticia.ra`) e `regiao`. `aria-pressed={selecionado}`.

### `CardResumo` (`components/CardResumo/`)
- Props: `noticia: Noticia`.
- Exibe: badge de risco (`noticia.risco`, cores: Alto=vermelho de status,
  Médio=`#f8c311`, Baixo=`#016d01`), título, `RA-XXXXX`, `regiao` (localização) e
  `data`.
- Link "Ver detalhes" (`next/link` para `/ocorrencia/{noticia.id}`).
- **Não** renderiza nenhum resumo de IA (RF10).

### `PainelFiltros` (atualização)
- Novas props: `onSelecionarNoticia: (noticia: Noticia) => void`,
  `noticiaSelecionadaId?: string`.
- Estado existente (`regiao`, `periodo`, `busca`, `expandido`) inalterado.
- Computa `filtros: FiltrosBusca = { regiao, periodo, busca }` e
  `resultados = filtrarNoticias(noticias, filtros)` a cada render (sem novo
  estado — derivado).
- Na seção `resultados` (`aria-label="Resultados da busca"`):
  - Se `!algumFiltroAplicado(filtros)`: nada é renderizado (estado inicial).
  - Senão se `resultados.length === 0`: texto "Nenhum resultado encontrado".
  - Senão: `<ul>` com um `ResultadoBusca` por item de `resultados`, `onSelecionar`
    chama `onSelecionarNoticia(noticia)`.
- "Limpar filtros" continua resetando `regiao`/`periodo`/`busca` (área de
  resultados volta ao estado inicial vazio, derivado automaticamente).

### `MapaInterativo` / `MapView` (atualização)
- `MapaInterativo` recebe e repassa `noticiaSelecionada?: Noticia | null` para
  `MapView`.
- `MapView`, quando `noticiaSelecionada` existe:
  - Renderiza um `<Marker position={[lat, lng]} icon={pinIcon}>` (ícone via
    `L.divIcon`, SVG inline nas cores da paleta — evita problemas de assets do
    Leaflet no Next.js).
  - Dentro do `Marker`, um `<Popup autoPan={false}>` (sempre aberto, via
    `ref`/`useEffect` chamando `openPopup()`, ou `Popup` com prop que mantenha
    aberto) contendo `<CardResumo noticia={noticiaSelecionada} />` — o popup do
    Leaflet já se posiciona acima do marcador, atendendo "card acima do pin".
- Sem `noticiaSelecionada`: comportamento atual (nenhum marcador), preservando o
  teste existente "renders without any markers by default".

### `view/Mapa/Mapa.tsx` (atualização)
- Passa a ser `"use client"`.
- `const [noticiaSelecionada, setNoticiaSelecionada] = useState<Noticia | null>(null)`.
- `<PainelFiltros onSelecionarNoticia={setNoticiaSelecionada} noticiaSelecionadaId={noticiaSelecionada?.id} />`
- `<MapaInterativo noticiaSelecionada={noticiaSelecionada} />`

### `view/OcorrenciaDetalhes/OcorrenciaDetalhes.tsx` (novo)
- `"use client"`. Props: `noticia: Noticia`.
- `useEffect` chama `gerarResumoIA(noticia)`:
  - estado `status: "loading" | "ready" | "error"`, `resumoIA: string | null`.
  - `loading` inicial → exibe indicador de carregamento ("Carregando resumo...").
  - sucesso → `status = "ready"`, exibe `resumoIA`.
  - erro → `status = "error"`, exibe mensagem de indisponibilidade ("Não foi
    possível gerar o resumo de IA para esta ocorrência.").
- Exibe também: título, badge de risco, `RA-XXXXX`, `regiao`, `data` (mesmos dados
  do `CardResumo`, em layout de página completa).

### `app/ocorrencia/[id]/page.tsx` (novo)
- Server component. `params: { id: string }`.
- Busca `noticia = noticias.find(n => n.id === id)` (`utils/noticias.ts`).
- Se não encontrada: `notFound()` (Next.js).
- Renderiza `<OcorrenciaDetalhes noticia={noticia} />`.

## Estilo visual (paleta da constitution)
- Badge de risco "Alto": vermelho de status (`#c0392b`) — cor semântica de risco,
  não substitui a identidade (verde/amarelo/branco continuam dominantes no
  layout).
- Badge "Médio": `#f8c311` (amarelo). Badge "Baixo": `#016d01` (verde).
- `CardResumo`: fundo `#ffffff`, borda `#016d01`, `border-radius` ~12px, sombra
  leve — visualmente menor que o painel "FILTROS".
- "Nenhum resultado encontrado": texto cinza centralizado, mesma tipografia do
  painel.
- Tela de detalhes: segue o mesmo padrão de cores e tipografia das demais
  páginas (`Header`/`Drawer` mantidos via layout existente).

## Testes
- `__tests__/utils/filtros.test.ts`: casos para `filtrarNoticias`
  (região/período/busca isolados e combinados, interseção vazia) e
  `algumFiltroAplicado`.
- `__tests__/utils/iaResumo.test.ts`: resolve com string para notícia comum;
  rejeita para a notícia `id "5"`.
- `__tests__/components/ResultadoBusca.test.tsx`: renderização de
  título/RA/região, `onSelecionar` ao clicar, `aria-pressed`.
- `__tests__/components/CardResumo.test.tsx`: renderiza risco/título/RA/local/data,
  link "Ver detalhes" aponta para `/ocorrencia/{id}`, **não** renderiza resumo de
  IA.
- `__tests__/components/PainelFiltros.test.tsx`: extensão —
  - sem filtros: área de resultados vazia (sem lista, sem mensagem).
  - com filtro sem correspondência: "Nenhum resultado encontrado".
  - com filtro com correspondência: lista de `ResultadoBusca`; clique chama
    `onSelecionarNoticia`.
- `__tests__/components/MapaInterativo.test.tsx`: extensão — com
  `noticiaSelecionada`, renderiza `Marker`/`Popup` (mockados) com `CardResumo`;
  sem ela, comportamento atual (sem marcador).
- `__tests__/view/OcorrenciaDetalhes.test.tsx`: estados `loading` → `ready` e
  `loading` → `error` (mock de `gerarResumoIA`).
