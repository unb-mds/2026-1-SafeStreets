import Link from "next/link";
import type { Noticia } from "@/utils/noticias";
import styles from "./CardResumo.module.css";

interface CardResumoProps {
  noticia: Noticia;
}

const RISCO_CLASSNAME: Record<Noticia["risco"], string> = {
  Alto: styles.riscoAlto,
  Médio: styles.riscoMedio,
  Baixo: styles.riscoBaixo,
};

export default function CardResumo({ noticia }: CardResumoProps) {
  return (
    <article className={styles.card} aria-label="Card resumo da ocorrência">
      <span className={`${styles.badgeRisco} ${RISCO_CLASSNAME[noticia.risco]}`}>{noticia.risco}</span>
      <h3 className={styles.titulo}>{noticia.titulo}</h3>
      <dl className={styles.detalhes}>
        <div className={styles.linha}>
          <dt>RA</dt>
          <dd>{noticia.ra}</dd>
        </div>
        <div className={styles.linha}>
          <dt>Localização</dt>
          <dd>{noticia.regiao}</dd>
        </div>
        <div className={styles.linha}>
          <dt>Data</dt>
          <dd>{noticia.data}</dd>
        </div>
      </dl>
      <Link href={`/ocorrencia/${noticia.id}`} className={styles.verDetalhes}>
        Ver detalhes
      </Link>
    </article>
  );
}
