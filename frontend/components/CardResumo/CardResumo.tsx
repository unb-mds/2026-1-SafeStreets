import type { Noticia } from "@/utils/noticias";
import { PinIcon } from "@/components/icons";
import styles from "./CardResumo.module.css";

interface CardResumoProps {
  noticia: Noticia;
  onVerDetalhes: () => void;
}

const RISCO_CLASSNAME: Record<Noticia["risco"], string> = {
  Alto: styles.riscoAlto,
  Médio: styles.riscoMedio,
  Baixo: styles.riscoBaixo,
};

export default function CardResumo({ noticia, onVerDetalhes }: CardResumoProps) {
  return (
    <article className={styles.card} aria-label="Card resumo da ocorrência">
      <span className={`${styles.badgeRisco} ${RISCO_CLASSNAME[noticia.risco]}`}>{noticia.risco}</span>
      <h3 className={styles.titulo}>{noticia.titulo}</h3>
      <div className={styles.detalhes}>
        <div className={styles.infoBloco}>
          {noticia.ra.toUpperCase().startsWith("RA") 
            ? noticia.ra.replace(/^RA[-—\s]*/i, "RA — ") 
            : `RA — ${noticia.ra}`}
        </div>
        <div className={`${styles.infoBloco} ${styles.infoBlocoLocalizacao}`}>
          <PinIcon size={10} />
          {noticia.regiao}
        </div>
        <div className={styles.infoBloco}>{noticia.data}</div>
      </div>
      <button type="button" className={styles.verDetalhes} onClick={onVerDetalhes}>
        Ver detalhes
      </button>
    </article>
  );
}
