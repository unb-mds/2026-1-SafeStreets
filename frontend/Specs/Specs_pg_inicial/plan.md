# Plano técnico — Feature 001: Página inicial estática + navegação

> Blueprint técnico derivado de `spec.md`. Respeita `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`.
> Referência visual: protótipo de alta fidelidade do SafeStreets.

## Stack (inalterada)
- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript + JSX
- **Estilização:** CSS Modules (`.module.css`)
- **Dados:** mocks estáticos em TypeScript (sem rede/backend nesta fase)
- **Fontes:** via `next/font/google` — Schibsted Grotesk, Plus Jakarta Sans, JetBrains Mono
- **Imagens:** logo do escudo otimizado via `next/image`

## Estrutura de pastas
```
app/
  layout.tsx              # layout raiz (server) → envolve children com <Chrome>
  globals.css             # reset + design tokens + fontes
  page.tsx                # rota "/" → Início (Hero + NewsFeed)
  page.module.css
  mapa/
    page.tsx              # placeholder estático "Mapa de risco — Em breve"
  sobre/
    page.tsx              # "Sobre nós" (texto estático sobre o projeto)
components/
  Chrome/
    Chrome.tsx            # "use client" — estado do drawer; renderiza Header + Drawer + children + Footer
    Chrome.module.css
  Header/
    Header.tsx            # barra clara: hambúrguer + Logo + campo de busca (visual)
    Header.module.css
  Drawer/
    Drawer.tsx            # menu lateral (overlay): NAVEGAÇÃO, itens c/ ícone+seta, item ativo, rodapé
    Drawer.module.css
  Hero/
    Hero.tsx              # eyebrow + título + subtítulo (só na home)
    Hero.module.css
  NewsFeed/
    NewsFeed.tsx          # título "Notícias" + contador + lista de NewsCard
    NewsFeed.module.css
  NewsCard/
    NewsCard.tsx          # placeholder de imagem, badges, título, descrição, fonte, link "Ler notícia"
    NewsCard.module.css
  Footer/
    Footer.tsx
    Footer.module.css
  Logo/
    Logo.tsx              # escudo (next/image) + marca "SafeStreets"
  icons/
    index.tsx             # ícones SVG: Menu, Search, Close, Home, Map, Info, Pin, ArrowRight
data/
  noticias.ts             # tipo Noticia + 6 notícias de exemplo
public/
  logo-escudo.png         # logo fornecido
```

## Design tokens (em `globals.css`)
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
  --cor-cinza:        #6b716b;  /* texto secundário, datas, fontes */
  --cor-linha:        #e3e8e3;  /* divisórias e bordas suaves */

  /* Tipografia */
  --font-display: "Schibsted Grotesk", system-ui, sans-serif;
  --font-body:    "Plus Jakarta Sans", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;
}
```

### Aplicação das cores/tipos
- **Barra superior:** fundo `--cor-superficie`, divisória `--cor-linha`. Marca "Safe" em
  `--cor-verde-escuro`, "Streets" em `--cor-amarelo` (font-display).
- **Hero:** eyebrow = pílula `--verde-tint` com texto `--cor-verde` em `--font-mono` (maiúsculas);
  título em `--cor-verde-escuro` (font-display, bold); subtítulo em `--cor-cinza`.
- **NewsCard:** superfície branca, borda `--cor-linha`, cantos arredondados, sombra leve.
  Placeholder de imagem = textura listrada em tons de `--verde-tint`/`--cor-verde` com rótulo
  em `--font-mono`. Badge de região = pílula `--cor-amarelo`. Data e fonte em `--cor-cinza`/`--font-mono`.
  Link "Ler notícia →" em `--cor-verde`.
- **Drawer:** painel `--cor-superficie` sobre backdrop escurecido; item ativo com fundo
  `--verde-tint` e caixa do ícone em `--cor-verde`; rótulo "NAVEGAÇÃO" em `--font-mono`.

## Modelo de dados (mock)
```ts
// data/noticias.ts
export type Noticia = {
  id: string;
  titulo: string;
  resumo: string;        // descrição breve exibida no card
  regiao: string;        // ex: "Plano Piloto"  → rótulo do placeholder e badge
  ra: string;            // ex: "RA-I"
  data: string;          // "dd/mm/aaaa"
  fonte: string;         // ex: "Boletim de Segurança · SSP-DF"
  // Campos para fases futuras (detalhe/mapa), fora do escopo do passo 1:
  // risco?: "low" | "med" | "high"; corpo?: string[]; x?: number; y?: number;
};

export const noticias: Noticia[] = [ /* 6 itens do protótipo */ ];
```

## Rotas
| Rota     | Página        | Conteúdo nesta fase                                   |
|----------|---------------|-------------------------------------------------------|
| `/`      | Início        | Header + Drawer + Hero + NewsFeed (mock) + Footer     |
| `/mapa`  | Mapa de risco | Header + Drawer + placeholder "Em breve" + Footer     |
| `/sobre` | Sobre nós     | Header + Drawer + texto sobre o projeto + Footer      |

Navegação client-side com `<Link>` do `next/link`.

## Decisões técnicas
| Decisão | Escolha | Por quê |
|---|---|---|
| Roteamento | App Router (`app/`) | Layout compartilhado simples; padrão atual do Next.js |
| Estado do menu | `Chrome` é client component com `useState` para abrir/fechar o drawer | É a **única** interatividade do passo 1; o resto permanece estático |
| Cores | Hex oficiais sobrepõem o protótipo | Protótipo usa `oklch` aproximado; a identidade oficial é `#016d01`/`#f8c311` |
| Dados | Array tipado em `data/` | Isola a camada de dados (constituição §7); troca futura por API sem mexer nos componentes |
| Busca / "Ler notícia" | Elementos visuais inertes | Busca (RF08) e detalhe (RF02) estão fora do escopo desta fase |
| Imagem do card | Placeholder listrado | Sem imagens reais nesta fase; mantém fidelidade ao protótipo |

## Riscos / atenção
- **Não acoplar componentes ao formato do mock.** `NewsCard` recebe uma `Noticia` por props;
  quando vier API, só a origem dos dados muda.
- O layout raiz não deve duplicar Header/Drawer/Footer por página — isso vive no `Chrome`.
- Manter `Chrome` enxuto: só o estado de abrir/fechar o menu. Nada de lógica de dados aqui.