import { PinIcon } from "@/components/icons";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.eyebrow}>
        <PinIcon size={13} color="var(--cor-verde)" />
        <span>SEGURANÇA EM TEMPO REAL · DF</span>
      </div>
      <h1 className={styles.title}>
        Sua região, mais<br />segura e transparente.
      </h1>
      <p className={styles.subtitle}>
        Acompanhe ocorrências, entenda padrões e consulte o nível de risco
        de cada Região Administrativa com resumos gerados por IA.
      </p>
    </section>
  );
}
