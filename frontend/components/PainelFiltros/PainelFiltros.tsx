"use client";

import { useState } from "react";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";
import { REGIOES_ADMINISTRATIVAS, PERIODOS } from "@/utils/filtros";
import styles from "./PainelFiltros.module.css";

const INITIAL_STATE = {
  regiao: "",
  periodo: "",
  busca: "",
};

export default function PainelFiltros() {
  const [regiao, setRegiao] = useState(INITIAL_STATE.regiao);
  const [periodo, setPeriodo] = useState(INITIAL_STATE.periodo);
  const [busca, setBusca] = useState(INITIAL_STATE.busca);
  const [expandido, setExpandido] = useState(true);

  function handleLimparFiltros() {
    setRegiao(INITIAL_STATE.regiao);
    setPeriodo(INITIAL_STATE.periodo);
    setBusca(INITIAL_STATE.busca);
  }

  return (
    <section className={styles.painel} aria-label="Filtros de busca">
      <div className={styles.cabecalho}>
        <h2 className={styles.titulo}>FILTROS</h2>
        <button
          type="button"
          className={styles.toggle}
          aria-label={expandido ? "Recolher filtros" : "Expandir filtros"}
          onClick={() => setExpandido((prev) => !prev)}
        >
          <ChevronDownIcon
            size={18}
            color="var(--cor-verde-escuro)"
            className={expandido ? styles.chevronAberto : styles.chevronFechado}
          />
        </button>
      </div>

      {expandido && (
        <div className={styles.corpo}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="filtro-regiao">
              Região Administrativa
            </label>
            <select
              id="filtro-regiao"
              aria-label="Região Administrativa"
              className={styles.select}
              value={regiao}
              onChange={(event) => setRegiao(event.target.value)}
            >
              <option value="">Escolha uma opção</option>
              {REGIOES_ADMINISTRATIVAS.map((regiaoOpcao) => (
                <option key={regiaoOpcao} value={regiaoOpcao}>
                  {regiaoOpcao}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="filtro-periodo">
              Período
            </label>
            <select
              id="filtro-periodo"
              aria-label="Período"
              className={styles.select}
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
            >
              <option value="">Escolha uma opção</option>
              {PERIODOS.map((periodoOpcao) => (
                <option key={periodoOpcao.value} value={periodoOpcao.value}>
                  {periodoOpcao.label}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className={styles.limparFiltros} onClick={handleLimparFiltros}>
            Limpar filtros
          </button>
        </div>
      )}

      <hr className={styles.divisoria} />

      <div className={styles.buscaSection}>
        <div className={styles.buscaContainer}>
          <input
            type="text"
            className={styles.buscaInput}
            placeholder="Buscar"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
          <SearchIcon size={18} color="var(--cor-cinza)" className={styles.buscaIcone} />
        </div>
        <div className={styles.resultados} aria-label="Resultados da busca" />
      </div>
    </section>
  );
}
