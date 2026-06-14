# Plano técnico — Feature 002: Mapa interativo

> Blueprint técnico derivado de `spec.md`. Respeita `.2026-1-SafeStreets\frontend\Specs\Specs_pg_inicial\constitution.md`.
> Referência visual: protótipo de alta fidelidade do SafeStreets (tela: Mapa de risco).

## Stack
- **Framework:** Next.js (App Router) — já configurado no projeto.
- **Linguagem:** TypeScript + JSX.
- **Mapa:** [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/),
  com tiles do **OpenStreetMap**.
  - Justificativa: open-source, gratuito, sem necessidade de chave de API
    (atende RNF07 — nenhuma credencial exposta no frontend).
  - Componente do mapa precisa ser **Client Component** (`"use client"`) e carregado
    via `next/dynamic` com `ssr: false`, pois Leaflet acessa `window`/`document`
    e não pode ser renderizado no servidor.
- **Estilização:** CSS Modules (`.module.css`), conforme constituição.

## Estrutura de pastas (incrementos sobre a estrutura atual)
```
frontend/
  app/
    mapa/
      page.tsx                    # inalterado: continua renderizando view/Mapa/Mapa.tsx
  view/
    Mapa/
      Mapa.tsx                    # passa a renderizar <MapaInterativo /> em tela cheia
      Mapa.module.css             # layout full-screen (sem Footer)
  components/
    Chrome/
      Chrome.tsx                  # passa a aceitar variante "overlay" para a rota /mapa
      Chrome.module.css           # estilos de overlay (Header/Drawer transparentes sobre o mapa)
    MapaInterativo/
      MapaInterativo.tsx          # "use client" — dynamic import do MapView (ssr: false)
      MapaInterativo.module.css   # container full-screen
      MapView.tsx                 # "use client" — MapContainer + TileLayer do react-leaflet
  style/
    globals.css                   # ajuste: permitir layout full-bleed na rota /mapa
```

## Comportamento do `Chrome` na rota `/mapa`
- O `Chrome` detecta a rota atual (via `usePathname`).
- Quando a rota é `/mapa`:
  - `Footer` não é renderizado.
  - `Header` e `Drawer` são renderizados em posição `absolute`/`fixed`, com fundo
    transparente (ou translúcido leve), sobre o mapa — sem faixa de cor de fundo
    separando-os da área do mapa.
  - O conteúdo (`children`, isto é, `<Mapa />`) ocupa `100vw` x `100vh`.
- Em outras rotas, o comportamento atual (`Header` opaco + `Footer`) é preservado.

## Configuração do mapa (`MapView.tsx`)
- `MapContainer`:
  - `center`: `[-15.7797, -47.9297]` (centro aproximado do DF).
  - `zoom`: `11` (zoom padrão que enquadra as Regiões Administrativas do DF).
  - `zoomControl`: `false` (controle padrão desabilitado), `scrollWheelZoom`: `true`,
    `dragging`: `true`.
  - `style`: `{ width: "100%", height: "100%" }`.
  - `<ZoomControl position="bottomleft" />`: controle de zoom reposicionado para o
    canto inferior esquerdo, evitando sobreposição com o logo/botão de menu do
    `Header` overlay (canto superior esquerdo).
- `TileLayer`:
  - `url`: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
  - `attribution`: `&copy; OpenStreetMap contributors` (obrigatório pela licença ODbL).
- **Sem marcadores** nesta feature (conforme `spec.md`) — o array de ocorrências
  fica vazio/ausente; a camada de marcadores será adicionada em feature futura
  (RF04/RF06).

## Dependências novas
Adicionar em `frontend/package.json`:
- `leaflet`
- `react-leaflet`
- `@types/leaflet` (devDependency)

## Estilo CSS do mapa
- O CSS do Leaflet (`leaflet/dist/leaflet.css`) deve ser importado uma única vez,
  em `MapaInterativo.tsx` ou em `style/globals.css`.
- `MapaInterativo.module.css` e `Mapa.module.css` definem `width: 100vw; height: 100vh;`
  (ou `100dvh`) para o container do mapa.

## Testes
- Seguir o padrão de `frontend/__tests__/components/`.
- Como Leaflet depende do DOM/`window`, os testes do `MapaInterativo`/`MapView`
  devem usar mocks (ex.: mockar `react-leaflet` com `jest.mock`) para verificar que
  o componente renderiza o container do mapa sem erros em ambiente `jsdom`.
- Teste do `Chrome`: verificar que, na rota `/mapa`, o `Footer` não é renderizado e
  o `Header`/`Drawer` recebem a variante "overlay".
