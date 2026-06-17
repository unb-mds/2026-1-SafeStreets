# Plano técnico — Feature 003: Dashboard de Busca — Painel de Filtros

> Blueprint técnico derivado de `spec.md`. Respeita `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`.
> Referência visual: protótipo de alta fidelidade do SafeStreets (painel "FILTROS"
> sobreposto ao mapa).

## Stack
- **Framework:** Next.js (App Router) — já configurado.
- **Linguagem:** TypeScript + JSX.
- **Estilização:** CSS Modules (`.module.css`), conforme constituição. Sem
  dependências novas.
- **Estado:** `useState` local no componente `PainelFiltros` (sem necessidade de
  estado global nesta entrega).

## Estrutura de pastas (incrementos sobre a estrutura atual)
```
frontend/
  utils/
    noticias.ts                 # inalterado
    filtros.ts                  # novo: REGIOES_ADMINISTRATIVAS, PERIODOS
  components/
    icons/
      index.tsx                 # + ChevronDownIcon
    PainelFiltros/
      PainelFiltros.tsx         # "use client" — painel de filtros
      PainelFiltros.module.css
  view/
    Mapa/
      Mapa.tsx                  # + <PainelFiltros /> como overlay
      Mapa.module.css           # position: relative no container
```

## Camada de dados (`utils/filtros.ts`)
- `REGIOES_ADMINISTRATIVAS: string[]`: lista derivada de
  `noticias.map(n => n.regiao)`, sem duplicatas, ordenada alfabeticamente. Mantém
  o princípio de separação de camadas (frontend não acessa fonte de dados
  diretamente — hoje mock, futuramente API).
- `PERIODOS: { value: string; label: string }[]`: opções estáticas mockadas:
  - `{ value: "7d", label: "Últimos 7 dias" }`
  - `{ value: "30d", label: "Últimos 30 dias" }`
  - `{ value: "3m", label: "Últimos 3 meses" }`
  - `{ value: "1y", label: "Último ano" }`

## Componente `PainelFiltros`
- **Props:** nenhuma nesta entrega (estado totalmente local/interno).
- **Estado interno (`useState`):**
  - `regiao: string` (default `""`)
  - `periodo: string` (default `""`)
  - `busca: string` (default `""`)
  - `expandido: boolean` (default `true`)
- **Estrutura JSX:**
  - `<section>` raiz com `aria-label="Filtros de busca"`.
  - Cabeçalho: `<h2>FILTROS</h2>` + `<button>` com `ChevronDownIcon`
    (`aria-label="Recolher filtros"` / `"Expandir filtros"` conforme estado),
    que alterna `expandido`.
  - Corpo (renderizado apenas quando `expandido === true`):
    - `<label>` + `<select>` "Região Administrativa", `value={regiao}`,
      `onChange` atualiza estado. Primeira `<option value="">Escolha uma
      opção</option>`, seguida das opções de `REGIOES_ADMINISTRATIVAS`.
    - `<label>` + `<select>` "Período", mesmo padrão, opções de `PERIODOS`.
    - `<hr>`/divisória.
    - `<button>` "Limpar filtros": `onClick` reseta `regiao`, `periodo` e
      `busca` para os valores default.
    - `<div>` com `<input type="text" placeholder="Buscar">` controlado por
      `busca` + `SearchIcon` (de `components/icons`).
- **Sem chamadas de API** — apenas consome `REGIOES_ADMINISTRATIVAS` e
  `PERIODOS` de `utils/filtros.ts`.

## Ícone novo (`components/icons/index.tsx`)
- `ChevronDownIcon`: segue o mesmo padrão dos ícones existentes (`size`,
  `color`, `className`, `viewBox="0 0 24 24"`), path em formato de seta para
  baixo (`M6 9l6 6 6-6`).

## Integração com `/mapa`
- `view/Mapa/Mapa.tsx`: importa e renderiza `<PainelFiltros />` dentro do mesmo
  container (`styles.page`) que já contém `<MapaInterativo />`.
- `view/Mapa/Mapa.module.css`: adiciona `position: relative` ao `.page` (o mapa
  e o `MapaInterativo` continuam `width: 100%; height: 100%`, sem alteração de
  comportamento).
- `PainelFiltros.module.css`: o `<section>` raiz usa
  `position: absolute; top: 84px; right: 24px; z-index: 500;` (abaixo do
  `Header`/`Drawer`, que têm z-index maior, e acima do mapa Leaflet, cujos
  paines ficam em z-index < 500).

## Estilo visual (paleta da constitution)
- Card: fundo `#ffffff`, `border-radius` ~16px, `box-shadow` leve, padding
  interno consistente com o protótipo.
- Título "FILTROS": cor `#016d01` (verde principal), peso bold.
- Botão de recolher/expandir: círculo de fundo `#f8c311` (amarelo), ícone
  `ChevronDownIcon` em verde/branco.
- Selects: borda cinza clara, texto cinza, placeholder "Escolha uma opção".
- Botão "Limpar filtros": estilo outline (borda verde, texto verde, fundo
  transparente/branco).
- Campo "Buscar": fundo cinza claro, `border-radius` arredondado, ícone
  `SearchIcon` (`var(--cor-cinza)`).

## Testes
- Seguir o padrão de `frontend/__tests__/components/` e `__tests__/utils/`.
- `__tests__/utils/filtros.test.ts`: valida conteúdo/forma de
  `REGIOES_ADMINISTRATIVAS` e `PERIODOS`.
- `__tests__/components/PainelFiltros.test.tsx`: renderiza sem mocks externos
  (componente é puro React + CSS Modules, sem Leaflet/`next/dynamic`).
  Cobre: renderização inicial, seleção de região/período, digitação na busca,
  "Limpar filtros" e toggle de recolher/expandir.
- `__tests__/components/icons.test.tsx`: adiciona caso de snapshot/render para
  `ChevronDownIcon`, seguindo o padrão dos demais ícones já testados.
