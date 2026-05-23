# Estudo: Leaflet.js

## O que é

Leaflet.js é uma biblioteca JavaScript de código aberto para criação de mapas interativos em aplicações web. Lançada em 2011 por Vladimir Agafonkin, é hoje uma das bibliotecas de mapas mais utilizadas no mundo, presente em projetos que vão de portais de notícias a sistemas de monitoramento urbano.

Seu principal diferencial é a leveza: o arquivo principal tem menos de 40KB, o que a torna significativamente mais rápida de carregar do que alternativas como Google Maps API ou Mapbox GL JS, sem abrir mão de recursos essenciais para a maioria das aplicações.

---

## Como funciona

O Leaflet não gera as imagens do mapa por conta própria. Em vez disso, ele carrega tiles — pequenos fragmentos de imagem de 256x256 pixels que, quando organizados lado a lado, formam o mapa completo que o usuário vê na tela. Esses tiles são fornecidos por serviços externos chamados provedores de tiles.

O provedor mais comum e gratuito é o OpenStreetMap, cujos mapas são colaborativos e de uso aberto. Outros provedores populares incluem Mapbox, Stadia Maps e Esri, que oferecem estilos visuais diferentes e recursos adicionais, geralmente mediante cadastro ou pagamento.

Quando o usuário navega pelo mapa — arrastando ou dando zoom — o Leaflet solicita automaticamente os tiles correspondentes à área visível, criando a experiência de um mapa contínuo e interativo.

---

## Conceitos fundamentais

### Mapa (Map)

O objeto central do Leaflet. É inicializado apontando para um elemento HTML e definindo a posição inicial (latitude e longitude) e o nível de zoom.

```javascript
const mapa = L.map("container-do-mapa").setView([-15.7801, -47.9292], 12);
```

### Camada de Tiles (TileLayer)

Define qual provedor de mapas será usado como base visual.

```javascript
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(mapa);
```

### Marcador (Marker)

Representa um ponto específico no mapa. Pode ser clicado para exibir informações adicionais.

```javascript
L.marker([-15.8397, -48.0536]).addTo(mapa);
```

### Popup

Janela de informação que aparece ao clicar em um marcador ou em qualquer ponto do mapa.

```javascript
L.marker([-15.8397, -48.0536])
  .addTo(mapa)
  .bindPopup("Taguatinga, Distrito Federal");
```

### Camadas (Layers)

O Leaflet organiza os elementos do mapa em camadas independentes. Isso permite mostrar ou ocultar grupos de marcadores, polígonos ou outras formas geométricas sem afetar o restante do mapa. É útil quando se quer separar diferentes categorias de informação visualmente.

---

## Tipos de elementos suportados

Além de marcadores pontuais, o Leaflet suporta uma variedade de formas geométricas para representar dados geográficos:

- **Círculo** — útil para representar áreas de abrangência ou raios de influência
- **Polígono** — delimita regiões, bairros ou zonas
- **Polilinha** — representa rotas, trajetos ou limites lineares
- **GeoJSON** — formato padrão para dados geográficos complexos; o Leaflet lê e renderiza arquivos GeoJSON diretamente

---

## Integração com React

Para projetos desenvolvidos em React ou Next.js, existe a biblioteca `react-leaflet`, que encapsula os recursos do Leaflet em componentes React, facilitando a integração com o ecossistema moderno de desenvolvimento front-end.

```tsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function Mapa() {
  return (
    <MapContainer center={[-15.7801, -47.9292]} zoom={12} style={{ height: "500px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[-15.8397, -48.0536]}>
        <Popup>Taguatinga, Distrito Federal</Popup>
      </Marker>
    </MapContainer>
  );
}
```

**Atenção:** o Leaflet acessa o objeto `window` do navegador durante a inicialização, o que causa conflito com o SSR (Server-Side Rendering) do Next.js. Para evitar erros de build, o componente de mapa deve ser carregado dinamicamente com a opção `ssr: false`:

```tsx
import dynamic from "next/dynamic";

const Mapa = dynamic(() => import("./Mapa"), { ssr: false });
```

---

## Instalação

Via npm:

```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

Importação do CSS obrigatório (sem ele, os mapas e marcadores não renderizam corretamente):

```tsx
import "leaflet/dist/leaflet.css";
```

---

## Vantagens

- **Gratuito e de código aberto** — sem custos de licença ou limites de requisição impostos pela biblioteca em si
- **Leve** — carregamento rápido mesmo em conexões mais lentas
- **Extensível** — possui um ecossistema amplo de plugins para clustering de marcadores, heatmaps, animações, geocodificação e muito mais
- **Bem documentado** — documentação oficial clara com exemplos interativos em [leafletjs.com](https://leafletjs.com)
- **Compatível com qualquer back-end** — recebe coordenadas em JSON e as renderiza, independentemente da tecnologia usada no servidor
