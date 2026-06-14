"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export const DF_CENTER: [number, number] = [-15.7797, -47.9297];
export const DF_DEFAULT_ZOOM = 11;

export default function MapView() {
  return (
    <MapContainer
      center={DF_CENTER}
      zoom={DF_DEFAULT_ZOOM}
      scrollWheelZoom
      zoomControl={false}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomleft" />
    </MapContainer>
  );
}
