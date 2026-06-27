"use client";

import { useEffect, useState } from "react";
import type { Noticia } from "@/utils/noticias";
import { gerarResumoIA } from "@/utils/iaResumo";
import { PinIcon } from "@/components/icons";
import styles from "./DetalhesOcorrencia.module.css";

interface DetalhesOcorrenciaProps {
  noticia: Noticia;
  onFechar: () => void;
}

type ResumoIAStatus = "loading" | "ready" | "error";

const RISCO_CLASSNAME: Record<Noticia["risco"], string> = {
  Alto: styles.riscoAlto,
  Médio: styles.riscoMedio,
  Baixo: styles.riscoBaixo,
};

export default function DetalhesOcorrencia({ noticia, onFechar }: DetalhesOcorrenciaProps) {
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
    <article className={styles.card} aria-label="Detalhes da ocorrência">
      <button type="button" className={styles.fechar} aria-label="Fechar detalhes" onClick={onFechar}>
        ×
      </button>
      <span className={`${styles.badgeRisco} ${RISCO_CLASSNAME[noticia.risco]}`}>{noticia.risco}</span>
      <h2 className={styles.titulo}>{noticia.titulo}</h2>
      <div className={styles.detalhes}>
        <div className={styles.infoBloco}>RA — {noticia.ra}</div>
        <div className={`${styles.infoBloco} ${styles.infoBlocoLocalizacao}`}>
          <PinIcon size={12} />
          {noticia.regiao}
        </div>
        <div className={styles.infoBloco}>{noticia.data}</div>
      </div>

      <section className={styles.resumoIA} aria-label="Resumo gerado por IA">
        <h3 className={styles.resumoIATitulo}>Resumo gerado por IA</h3>
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
