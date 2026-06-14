"use client";

import dynamic from "next/dynamic";
import type { Noticia } from "@/utils/noticias";
import DetalhesOcorrencia from "@/components/DetalhesOcorrencia/DetalhesOcorrencia";
import styles from "./MapaInterativo.module.css";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
});

interface MapaInterativoProps {
  noticiaSelecionada?: Noticia | null;
  detalhesAbertos?: boolean;
  onVerDetalhes?: () => void;
  onFecharDetalhes?: () => void;
}

export default function MapaInterativo({
  noticiaSelecionada = null,
  detalhesAbertos = false,
  onVerDetalhes = () => {},
  onFecharDetalhes = () => {},
}: MapaInterativoProps) {
  return (
    <div className={styles.container}>
      <MapView noticiaSelecionada={noticiaSelecionada} onVerDetalhes={onVerDetalhes} />
      {detalhesAbertos && noticiaSelecionada && (
        <DetalhesOcorrencia noticia={noticiaSelecionada} onFechar={onFecharDetalhes} />
      )}
    </div>
  );
}
