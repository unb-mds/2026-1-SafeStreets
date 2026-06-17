"use client";

import { useState } from "react";
import MapaInterativo from "@/components/MapaInterativo/MapaInterativo";
import PainelFiltros from "@/components/PainelFiltros/PainelFiltros";
import type { Noticia } from "@/utils/noticias";
import styles from "./Mapa.module.css";

export default function Mapa() {
  const [noticiaSelecionada, setNoticiaSelecionada] = useState<Noticia | null>(null);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);

  const handleSelecionarNoticia = (noticia: Noticia) => {
    setNoticiaSelecionada(noticia);
    setDetalhesAbertos(false);
  };

  return (
    <div className={styles.page}>
      <MapaInterativo
        noticiaSelecionada={noticiaSelecionada}
        detalhesAbertos={detalhesAbertos}
        onVerDetalhes={() => setDetalhesAbertos(true)}
        onFecharDetalhes={() => setDetalhesAbertos(false)}
      />
      <PainelFiltros
        onSelecionarNoticia={handleSelecionarNoticia}
        noticiaSelecionadaId={noticiaSelecionada?.id}
      />
    </div>
  );
}
