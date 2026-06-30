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

function formatarParagrafos(corpo: string[]): string[] {
  if (corpo.length !== 1) {
    return corpo;
  }

  const texto = corpo[0];
  
  // Adiciona divisores antes/depois de palavras de legenda comuns (case-insensitive)
  let processado = texto.replace(/(Reprodução|Foto:|Crédito:)/gi, "\n$1\n");
  
  // Adiciona divisor antes de emojis como ✅
  processado = processado.replace(/(✅)/g, "\n$1");
  
  // Adiciona divisores após pontos finais (quando seguidos de espaço)
  processado = processado.replace(/\.\s+/g, ".\n");
  
  const linhas = processado.split("\n").map((l) => l.trim()).filter(Boolean);
  
  const novosParagrafos: string[] = [];
  let bufferFrases: string[] = [];
  
  for (const linha of linhas) {
    const ehLegenda = /^(Reprodução|Foto:|Crédito:)/i.test(linha);
    const ehCta = /^✅/.test(linha);
    
    if (ehLegenda || ehCta) {
      if (bufferFrases.length > 0) {
        novosParagrafos.push(bufferFrases.join(" "));
        bufferFrases = [];
      }
      novosParagrafos.push(linha);
    } else {
      bufferFrases.push(linha);
      if (bufferFrases.length >= 2) {
        novosParagrafos.push(bufferFrases.join(" "));
        bufferFrases = [];
      }
    }
  }
  
  if (bufferFrases.length > 0) {
    novosParagrafos.push(bufferFrases.join(" "));
  }
  
  return novosParagrafos;
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
        {formatarParagrafos(noticia.corpo).map((paragrafo, indice) => (
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
