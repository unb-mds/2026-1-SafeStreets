import type { Noticia } from "@/utils/noticias";
import { PinIcon, ArrowRightIcon } from "@/components/icons";
import styles from "./NewsCard.module.css";

interface NewsCardProps {
  noticia: Noticia;
}

export default function NewsCard({ noticia }: NewsCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.body}>
        {/* Badges */}
        <div className={styles.badges}>
          <span className={styles.badgeRegiao}>
            <PinIcon size={11} color="var(--cor-verde-escuro)" />
            {noticia.regiao}
          </span>
          <span className={styles.badgeData}>{noticia.data}</span>
        </div>

        {/* Título */}
        <h2 className={styles.titulo}>{noticia.titulo}</h2>

        {/* Resumo */}
        <p className={styles.resumo}>{noticia.resumo}</p>

        {/* Rodapé */}
        <div className={styles.cardFooter}>
          <span className={styles.lerNoticia}>
            Ler notícia
            <ArrowRightIcon size={14} color="var(--cor-verde)" />
          </span>
        </div>
      </div>
    </article>
  );
}
