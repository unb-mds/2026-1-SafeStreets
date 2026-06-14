"use client";

import { useState } from "react";
import MapaInterativo from "@/components/MapaInterativo/MapaInterativo";
import PainelFiltros from "@/components/PainelFiltros/PainelFiltros";
import type { Noticia } from "@/utils/noticias";
import styles from "./Mapa.module.css";

export default function Mapa() {
  const [noticiaSelecionada, setNoticiaSelecionada] = useState<Noticia | null>(null);

  return (
    <div className={styles.page}>
      <MapaInterativo noticiaSelecionada={noticiaSelecionada} />
      <PainelFiltros
        onSelecionarNoticia={setNoticiaSelecionada}
        noticiaSelecionadaId={noticiaSelecionada?.id}
      />
    </div>
  );
}
