# Plano técnico — Feature 001: Página inicial + navegação

> Blueprint técnico derivado de `spec.md`. Respeita `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`.
> Referência visual: protótipo de alta fidelidade do SafeStreets.
>
> **Status:** atualizado após a implementação para refletir a estrutura de pastas real
> (`view/`, `style/`, `utils/`, `app/` como camada fina de roteamento) e a busca funcional.

## Stack (inalterada)
- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript + JSX
- **Estilização:** CSS Modules (`.module.css`)
- **Dados:** mocks estáticos em TypeScript (sem rede/backend nesta fase)
- **Fontes:** via `next/font/google` — Schibsted Grotesk, Plus Jakarta Sans, JetBrains Mono
- **Imagens:** logo do escudo otimizado via `next/image`

## Estrutura de pastas
> Por decisão de arquitetura do frontend, o código vive em `components/`, `style/`,
> `utils/` e `view/`. As pastas `app/` e `public/` são exigidas pelo Next.js (App Router
> e estáticos), então `app/` é mantida como uma **camada fina de roteamento**: cada
> `page.tsx` apenas importa e renderiza a `view` correspondente.

```
app/
  layout.tsx              # layout raiz (server) → <SearchProvider> + <Chrome> envolvendo children
  page.tsx                # rota "/"     → renderiza <Home />
  mapa/
    page.tsx              # rota "/mapa" → renderiza <Mapa /> (entregue pela feature dashboard)
  noticia/
    [id]/
      page.tsx           # rota "/noticia/{id}" → busca a notícia por id e renderiza <NoticiaDetalhe /> (notFound se não existir)
view/
  Home/
    Home.tsx              # "use client": lê o termo de busca, filtra notícias e monta Hero + NewsFeed
    Home.module.css
  Mapa/
    Mapa.tsx              # tela do mapa (feature dashboard de busca)
    Mapa.module.css
  NoticiaDetalhe/
    NoticiaDetalhe.tsx    # detalhamento (RF02): voltar, região, título, data, resumo, corpo, fonte original
    NoticiaDetalhe.module.css
components/
  Chrome/
    Chrome.tsx            # "use client": estado do drawer; lê contexto de busca; Header + Drawer + children + Footer
    Chrome.module.css     #              variante overlay/full-screen na rota /mapa
  SearchProvider/
    SearchProvider.tsx    # "use client": contexto de busca (query + setQuery) e hook useSearch
  Header/
    Header.tsx            # barra clara: hambúrguer + Logo + input de busca (controlado por props)
    Header.module.css
  Drawer/
    Drawer.tsx            # menu lateral: Início, Mapa de risco (rotas) e Sobre nós (link externo)
    Drawer.module.css
  Hero/
    Hero.tsx              # eyebrow + título + subtítulo (só na home)
    Hero.module.css
  NewsFeed/
    NewsFeed.tsx          # título "Notícias" + contador + lista de NewsCard + estado vazio
    NewsFeed.module.css
  NewsCard/
    NewsCard.tsx          # badges (região + data), título, descrição, link "Ler notícia →"
    NewsCard.module.css   # (sem imagem e sem fonte)
  Footer/
    Footer.tsx
    Footer.module.css
  Logo/
    Logo.tsx              # escudo (next/image) + marca "SafeStreets"
  icons/
    index.tsx             # ícones SVG: Menu, Search, Close, Home, Map, Info, Pin, ArrowRight, ChevronDown
style/
  globals.css             # reset + design tokens + variáveis de fonte
utils/
  noticias.ts             # tipo Noticia + 6 notícias de exemplo + getNoticiaPorId(id) (camada de dados)
  busca.ts                # filtrarNoticias(lista, termo): filtro puro, sem acento e case-insensitive
public/
  logo-escudo.png         # escudo usado no Header e no Drawer
```

## Design tokens (em `style/globals.css`)
```css
:root {
  /* Marca (cores oficiais — sobrepõem o protótipo) */
  --cor-verde:        #016d01;  /* marca / links / ícones ativos */
  --cor-amarelo:      #f8c311;  /* destaque / badge de região */
  --cor-branco:       #ffffff;

  /* Derivadas */
  --cor-verde-escuro: #013d12;  /* títulos / "ink" */
  --verde-tint:       #e8f3ea;  /* fundo de pílulas verdes e do item ativo do menu */
  --cor-fundo:        #f4f7f2;  /* off-white levemente esverdeado (fundo da página) */
  --cor-superficie:   #ffffff;  /* fundo de cards e barras */
  --cor-texto:        #2b2f2b;  /* corpo */
  --cor-cinza:        #6b716b;  /* texto secundário, datas */
  --cor-linha:        #e3e8e3;  /* divisórias e bordas suaves */

  /* Tipografia */
  --font-display: "Schibsted Grotesk", system-ui, sans-serif;
  --font-body:    "Plus Jakarta Sans", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;
}
```

### Aplicação das cores/tipos
- **Barra superior:** fundo `--cor-superficie`, divisória `--cor-linha`. Marca "Safe" em
  `--cor-verde-escuro`, "Streets" em `--cor-amarelo` (font-display). Input de busca com
  borda `--cor-linha` que vira `--cor-verde` em foco.
- **Hero:** eyebrow = pílula `--verde-tint` com texto `--cor-verde` em `--font-mono` (maiúsculas);
  título em `--cor-verde-escuro` (font-display, bold); subtítulo em `--cor-cinza`.
- **NewsCard:** superfície branca, borda `--cor-linha`, cantos arredondados, sombra leve.
  Badge de região = pílula `--cor-amarelo`. Data em `--cor-cinza`/`--font-mono`.
  Link "Ler notícia →" em `--cor-verde`, alinhado à direita no rodapé.
- **Drawer:** painel `--cor-superficie` sobre backdrop escurecido; item ativo com fundo
  `--verde-tint` e caixa do ícone em `--cor-verde`; rótulo "NAVEGAÇÃO" em `--font-mono`.

## Modelo de dados (mock)
```ts
// utils/noticias.ts
export type Noticia = {
  id: string;
  titulo: string;
  resumo: string;        // descrição breve exibida no card
  regiao: string;        // ex: "Plano Piloto"  → badge do card
  ra: string;            // ex: "RA-I"
  data: string;          // "dd/mm/aaaa"
  fonte: string;         // ex: "Boletim de Segurança · SSP-DF" (não exibido no card; usado na busca)
  corpo: string[];       // parágrafos da descrição detalhada (RF02)
  fonteUrl: string;      // link da fonte de dados original (RF02)
};

export const noticias: Noticia[] = [ /* 6 itens do protótipo */ ];

// Lookup usado pela rota de detalhe:
export function getNoticiaPorId(id: string): Noticia | undefined;
```

## Busca (RF08)
- **Estado:** `SearchProvider` (contexto React client) guarda `query` + `setQuery`, com
  valores-padrão seguros (`query: ""`, `setQuery` no-op) para componentes usados fora do provider.
- **Entrada:** o `Header` é apresentacional — recebe `searchQuery` e `onSearchChange` por
  props. O `Chrome` lê o contexto (`useSearch`) e injeta esses props no `Header`.
- **Filtro:** `utils/busca.ts` expõe `filtrarNoticias(lista, termo)` — função pura que
  normaliza (minúsculas, sem acentos, trim) e casa o termo contra título, resumo, região e fonte.
- **Saída:** `Home` (client) lê `useSearch`, aplica `filtrarNoticias` sobre os mocks e
  passa a lista filtrada ao `NewsFeed`. Lista vazia → estado "Nenhuma notícia encontrada".

## Rotas
| Rota     | Página        | Conteúdo                                                  |
|----------|---------------|----------------------------------------------------------|
| `/`            | Início        | Header + Drawer + Hero + NewsFeed (mock, filtrável) + Footer |
| `/mapa`        | Mapa de risco | Entregue pela feature **dashboard de busca** (Header overlay, sem Footer) |
| `/noticia/{id}`| Detalhe       | Header + Drawer + `NoticiaDetalhe` (SSG via `generateStaticParams`; `notFound` se id inválido) + Footer |

- "Sobre nós" **não é rota interna**: é um link externo (`<a target="_blank">`) para o
  site institucional `https://unb-mds.github.io/2026-1-SafeStreets/`.
- Navegação interna client-side com `<Link>` do `next/link`.

## Decisões técnicas
| Decisão | Escolha | Por quê |
|---|---|---|
| Roteamento | App Router (`app/`) como camada fina → `view/` | `app/` é exigida pelo Next.js; o conteúdo real fica em `view/` conforme a arquitetura do frontend |
| Estrutura de pastas | `components/` / `style/` / `utils/` / `view/` | Arquitetura definida para o frontend; `data/` e CSS dentro de `app/` foram realocados |
| Estado do menu | `Chrome` é client component com `useState` | Interatividade do shell (drawer) |
| Estado da busca | Contexto `SearchProvider` + hook `useSearch` | Desacopla Header (publica o termo) de Home (consome e filtra); evita CSR forçado de `useSearchParams` e mantém `/` estática |
| Cores | Hex oficiais sobrepõem o protótipo | A identidade oficial é `#016d01`/`#f8c311` |
| Dados | Array tipado em `utils/noticias.ts` | Isola a camada de dados (constituição §7); troca futura por API sem mexer nos componentes |
| Card | Sem imagem e sem fonte | Decisão de produto: o card mostra apenas região, data, título, descrição e o CTA |
| "Sobre nós" | Link externo ao site institucional | Não há página interna "Sobre"; o conteúdo vive no site do projeto |
| Detalhe (RF02) | Rota dinâmica `/noticia/[id]` (server) + `NoticiaDetalhe` apresentacional | `page.tsx` faz o lookup por id e `notFound`; a view recebe a `Noticia` por props (testável e estática) |
| Fonte original | `<a target="_blank">` para `fonteUrl` | Link real da fonte de dados; abre em nova aba |

## Riscos / atenção
- **Não acoplar componentes ao formato do mock.** `NewsCard` recebe uma `Noticia` por props;
  quando vier API, só a origem dos dados muda.
- O layout raiz não deve duplicar Header/Drawer/Footer por página — isso vive no `Chrome`.
- Manter `Chrome` enxuto: estado do drawer + repasse do termo de busca ao Header. Sem lógica de dados.
- Manter o filtro de busca como função pura em `utils/` (testável isoladamente, reaproveitável).
