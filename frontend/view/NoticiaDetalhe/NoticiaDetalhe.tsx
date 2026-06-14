import Link from "next/link";
import type { Noticia } from "@/utils/noticias";
import {
  ArrowLeftIcon,
  PinIcon,
  ExternalLinkIcon,
} from "@/components/icons";
import styles from "./NoticiaDetalhe.module.css";

interface NoticiaDetalheProps {
  noticia: Noticia;
}

export default function NoticiaDetalhe({ noticia }: NoticiaDetalheProps) {
  return (
    <article className={styles.page}>
      <Link href="/" className={styles.voltar}>
        <ArrowLeftIcon size={16} color="var(--cor-verde-escuro)" />
        Voltar para notícias
      </Link>

      <span className={styles.badgeRegiao}>
        <PinIcon size={12} color="var(--cor-verde-escuro)" />
        {noticia.regiao}
      </span>

      <h1 className={styles.titulo}>{noticia.titulo}</h1>

      <p className={styles.data}>{noticia.data}</p>

      <p className={styles.resumo}>{noticia.resumo}</p>

      <div className={styles.corpo}>
        {noticia.corpo.map((paragrafo, indice) => (
          <p key={indice}>{paragrafo}</p>
        ))}
      </div>

      <div className={styles.fonteCard}>
        <div className={styles.fonteInfo}>
          <span className={styles.fonteIcone}>
            <ExternalLinkIcon size={18} color="var(--cor-verde)" />
          </span>
          <span className={styles.fonteTexto}>Acessar fonte original</span>
        </div>
        <a
          href={noticia.fonteUrl}
          className={styles.abrirLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir link
          <ExternalLinkIcon size={14} color="var(--cor-verde-escuro)" />
        </a>
      </div>
    </article>
  );
}
