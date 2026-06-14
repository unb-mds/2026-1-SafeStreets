"use client";

import { useEffect, useState } from "react";
import type { Noticia } from "@/utils/noticias";
import { gerarResumoIA } from "@/utils/iaResumo";
import styles from "./OcorrenciaDetalhes.module.css";

interface OcorrenciaDetalhesProps {
  noticia: Noticia;
}

type ResumoIAStatus = "loading" | "ready" | "error";

const RISCO_CLASSNAME: Record<Noticia["risco"], string> = {
  Alto: styles.riscoAlto,
  Médio: styles.riscoMedio,
  Baixo: styles.riscoBaixo,
};

export default function OcorrenciaDetalhes({ noticia }: OcorrenciaDetalhesProps) {
  const [status, setStatus] = useState<ResumoIAStatus>("loading");
  const [resumoIA, setResumoIA] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setStatus("loading");
    setResumoIA(null);

    gerarResumoIA(noticia)
      .then((resumo) => {
        if (!ativo) return;
        setResumoIA(resumo);
        setStatus("ready");
      })
      .catch(() => {
        if (!ativo) return;
        setStatus("error");
      });

    return () => {
      ativo = false;
    };
  }, [noticia]);

  return (
    <article className={styles.page}>
      <span className={`${styles.badgeRisco} ${RISCO_CLASSNAME[noticia.risco]}`}>{noticia.risco}</span>
      <h1 className={styles.titulo}>{noticia.titulo}</h1>
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

      <p className={styles.resumo}>{noticia.resumo}</p>

      <section className={styles.resumoIA} aria-label="Resumo gerado por IA">
        <h2 className={styles.resumoIATitulo}>Resumo gerado por IA</h2>
        {status === "loading" && <p className={styles.resumoIAEstado}>Carregando resumo...</p>}
        {status === "ready" && <p className={styles.resumoIATexto}>{resumoIA}</p>}
        {status === "error" && (
          <p className={styles.resumoIAEstado}>
            Não foi possível gerar o resumo de IA para esta ocorrência.
          </p>
        )}
      </section>
    </article>
  );
}
