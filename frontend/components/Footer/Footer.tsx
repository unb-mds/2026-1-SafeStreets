import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        © {new Date().getFullYear()} SafeStreets — Dados públicos de segurança do DF
      </p>
    </footer>
  );
}
