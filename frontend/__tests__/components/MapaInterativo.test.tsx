import React from "react";
import { render, screen } from "@testing-library/react";
import MapaInterativo from "@/components/MapaInterativo/MapaInterativo";

jest.mock("next/dynamic", () => () => {
  const MapView = require("@/components/MapaInterativo/MapView").default;
  return MapView;
});

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

  it("positions the zoom control at the bottom-left, away from the logo/menu", () => {
    render(<MapaInterativo />);
    expect(screen.getByTestId("zoom-control").getAttribute("data-position")).toBe(
      "bottomleft"
    );
  });
});
