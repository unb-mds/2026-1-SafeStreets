"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, ZoomControl, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Noticia } from "@/utils/noticias";
import CardResumo from "@/components/CardResumo/CardResumo";

export const DF_CENTER: [number, number] = [-15.7797, -47.9297];
export const DF_DEFAULT_ZOOM = 11;

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" fill="#016d01" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="12" cy="8" r="2.5" fill="#f8c311"/>
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapViewProps {
  noticiaSelecionada?: Noticia | null;
  onVerDetalhes?: () => void;
}

export default function MapView({ noticiaSelecionada = null, onVerDetalhes = () => {} }: MapViewProps) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (!noticiaSelecionada) return;

    const timeoutId = setTimeout(() => {
      markerRef.current?.openPopup();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [noticiaSelecionada]);

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
      {noticiaSelecionada && (
        <Marker ref={markerRef} position={[noticiaSelecionada.lat, noticiaSelecionada.lng]} icon={pinIcon}>
          <Popup closeButton={false} autoClose={false} autoPan={false}>
            <CardResumo noticia={noticiaSelecionada} onVerDetalhes={onVerDetalhes} />
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
