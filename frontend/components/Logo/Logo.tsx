import Image from "next/image";
import styles from "./Logo.module.css";

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 36 }: LogoProps) {
  return (
    <div className={styles.logo}>
      <Image
        src="/logo-escudo.png"
        alt="SafeStreets escudo"
        width={size}
        height={size}
        priority
      />
      <span className={styles.marca}>
        <span className={styles.safe}>Safe</span>
        <span className={styles.streets}>Streets</span>
      </span>
    </div>
  );
}
