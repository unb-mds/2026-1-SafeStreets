"use client";

import dynamic from "next/dynamic";
import type { Noticia } from "@/utils/noticias";
import styles from "./MapaInterativo.module.css";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
});

interface MapaInterativoProps {
  noticiaSelecionada?: Noticia | null;
}

export default function MapaInterativo({ noticiaSelecionada = null }: MapaInterativoProps) {
  return (
    <div className={styles.container}>
      <MapView noticiaSelecionada={noticiaSelecionada} />
    </div>
  );
}
