import type { Noticia } from "@/utils/noticias";
import styles from "./ResultadoBusca.module.css";

interface ResultadoBuscaProps {
  noticia: Noticia;
  selecionado: boolean;
  onSelecionar: () => void;
}

export default function ResultadoBusca({ noticia, selecionado, onSelecionar }: ResultadoBuscaProps) {
  return (
    <button
      type="button"
      className={`${styles.item} ${selecionado ? styles.itemSelecionado : ""}`}
      aria-pressed={selecionado}
      onClick={onSelecionar}
    >
      <span className={styles.titulo}>{noticia.titulo}</span>
      <span className={styles.detalhes}>
        <span className={styles.ra}>{noticia.ra}</span>
        <span className={styles.regiao}>{noticia.regiao}</span>
      </span>
    </button>
  );
}
