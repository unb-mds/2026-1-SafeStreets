import styles from "./page.module.css";

export default function MapaPage() {
  return (
    <div className={styles.page}>
      <p className={styles.label}>MAPA DE RISCO</p>
      <h1 className={styles.title}>Em breve</h1>
      <p className={styles.description}>
        O mapa interativo de risco por Região Administrativa está em desenvolvimento.
      </p>
    </div>
  );
}
