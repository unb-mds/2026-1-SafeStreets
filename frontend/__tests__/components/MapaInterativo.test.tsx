import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MapaInterativo from "@/components/MapaInterativo/MapaInterativo";
import type { Noticia } from "@/utils/noticias";

const noticias: Noticia[] = [
  {
    id: "1",
    titulo: "Furtos a pedestres aumentam 14% na quadra comercial da 304 Sul",
    resumo: "Câmeras e patrulhamento a pé serão reforçados após série de ocorrências no fim de tarde.",
    regiao: "Plano Piloto",
    ra: "RA-I",
    data: "02/06/2026",
    fonte: "Boletim de Segurança · SSP-DF",
    corpo: [
      "Primeiro parágrafo de teste.",
    ],
    fonteUrl: "https://www.ssp.df.gov.br/",
    risco: "Médio",
    lat: -15.7942,
    lng: -47.8822,
  }
];

jest.mock("next/dynamic", () => () => {
  const MapView = require("@/components/MapaInterativo/MapView").default;
  return MapView;
});

jest.mock("@/utils/iaResumo", () => ({
  gerarResumoIA: jest.fn(() => new Promise(() => {})),
}));

jest.mock("react-leaflet", () => ({
  MapContainer: ({
    children,
    center,
    zoom,
  }: {
    children: React.ReactNode;
    center: [number, number];
    zoom: number;
  }) => (
    <div
      data-testid="map-container"
      data-center={JSON.stringify(center)}
      data-zoom={zoom}
    >
      {children}
    </div>
  ),
  TileLayer: ({ url, attribution }: { url: string; attribution: string }) => (
    <div data-testid="tile-layer" data-url={url} data-attribution={attribution} />
  ),
  ZoomControl: ({ position }: { position: string }) => (
    <div data-testid="zoom-control" data-position={position} />
  ),
  Marker: ({ children, position }: { children: React.ReactNode; position: [number, number] }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
}));

describe("MapaInterativo", () => {
  it("renders the map container centered on the DF with the default zoom", () => {
    render(<MapaInterativo />);
    const map = screen.getByTestId("map-container");
    expect(map).toBeInTheDocument();
    expect(JSON.parse(map.getAttribute("data-center")!)).toEqual([-15.7797, -47.9297]);
    expect(map.getAttribute("data-zoom")).toBe("11");
  });

  it("renders the OpenStreetMap tile layer with attribution", () => {
    render(<MapaInterativo />);
    const tileLayer = screen.getByTestId("tile-layer");
    expect(tileLayer.getAttribute("data-url")).toContain("tile.openstreetmap.org");
    expect(tileLayer.getAttribute("data-attribution")).toMatch(/OpenStreetMap/i);
  });

  it("renders without any markers by default (edge: no ocorrências yet)", () => {
    render(<MapaInterativo />);
    expect(screen.queryByTestId("marker")).not.toBeInTheDocument();
  });

  it("renders without any markers when noticiaSelecionada is null", () => {
    render(<MapaInterativo noticiaSelecionada={null} />);
    expect(screen.queryByTestId("marker")).not.toBeInTheDocument();
  });

  describe("RF10 - pin e card resumo da notícia selecionada", () => {
    const noticia = noticias[0];

    it("renders a marker positioned at the noticia's lat/lng", () => {
      render(<MapaInterativo noticiaSelecionada={noticia} />);
      const marker = screen.getByTestId("marker");
      expect(JSON.parse(marker.getAttribute("data-position")!)).toEqual([noticia.lat, noticia.lng]);
    });

    it("renders a popup containing the CardResumo for the noticia", () => {
      render(<MapaInterativo noticiaSelecionada={noticia} />);
      const popup = screen.getByTestId("popup");
      expect(popup).toHaveTextContent(noticia.titulo);
      expect(popup).toHaveTextContent(noticia.risco);
      expect(popup).toHaveTextContent(noticia.ra);
    });
  });

  it("positions the zoom control at the bottom-left, away from the logo/menu", () => {
    render(<MapaInterativo />);
    expect(screen.getByTestId("zoom-control").getAttribute("data-position")).toBe(
      "bottomleft"
    );
  });

  describe("RF11 - card de detalhes da ocorrência", () => {
    const noticia = noticias[0];

    it("does not render the details card by default", () => {
      render(<MapaInterativo noticiaSelecionada={noticia} />);
      expect(screen.queryByLabelText("Detalhes da ocorrência")).not.toBeInTheDocument();
    });

    it('calls onVerDetalhes when "Ver detalhes" is clicked in the card resumo', async () => {
      const onVerDetalhes = jest.fn();
      render(<MapaInterativo noticiaSelecionada={noticia} onVerDetalhes={onVerDetalhes} />);

      await userEvent.click(screen.getByRole("button", { name: "Ver detalhes" }));
      expect(onVerDetalhes).toHaveBeenCalledTimes(1);
    });

    it("renders the details card when detalhesAbertos is true", () => {
      render(<MapaInterativo noticiaSelecionada={noticia} detalhesAbertos />);

      const detalhes = screen.getByLabelText("Detalhes da ocorrência");
      expect(detalhes).toHaveTextContent(noticia.titulo);
      expect(detalhes).not.toHaveTextContent(noticia.resumo);
    });

    it("calls onFecharDetalhes when the close button is clicked", async () => {
      const onFecharDetalhes = jest.fn();
      render(
        <MapaInterativo noticiaSelecionada={noticia} detalhesAbertos onFecharDetalhes={onFecharDetalhes} />
      );

      await userEvent.click(screen.getByRole("button", { name: /fechar/i }));
      expect(onFecharDetalhes).toHaveBeenCalledTimes(1);
    });
  });
});
