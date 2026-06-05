import styles from "./page.module.css";

export default function SobrePage() {
  return (
    <div className={styles.page}>
      <p className={styles.label}>SOBRE O PROJETO</p>
      <h1 className={styles.title}>Sobre nós</h1>
      <p className={styles.intro}>
        SafeStreets é uma plataforma de monitoramento inteligente de riscos urbanos no
        Distrito Federal, criada para transformar dados públicos de segurança em informação
        útil para o cidadão.
      </p>
      <div className={styles.content}>
        <h2 className={styles.subtitle}>Nossa missão</h2>
        <p>
          Queremos tornar a segurança pública mais transparente e acessível. Agregamos
          ocorrências por Região Administrativa, identificamos padrões e geramos resumos
          de risco com apoio de inteligência artificial.
        </p>
        <h2 className={styles.subtitle}>Fontes de dados</h2>
        <p>
          Utilizamos dados públicos da Secretaria de Segurança Pública do DF (SSP-DF),
          da Polícia Civil (PCDF) e da Polícia Militar (PMDF). Nenhum dado privado ou
          pessoal é coletado.
        </p>
        <h2 className={styles.subtitle}>Fase atual</h2>
        <p>
          O projeto está em desenvolvimento ativo. Esta versão apresenta a página
          inicial com feed de notícias estáticas. Em breve: mapa interativo de risco e
          resumos gerados por IA por Região Administrativa.
        </p>
      </div>
    </div>
  );
}
