import Link from "next/link";
import Logo from "@/components/Logo/Logo";
import { MenuIcon, SearchIcon } from "@/components/icons";
import styles from "./Header.module.css";

interface HeaderProps {
  onMenuClick: () => void;
  overlay?: boolean;
}

export default function Header({ onMenuClick, overlay = false }: HeaderProps) {
  return (
    <header
      className={overlay ? `${styles.header} ${styles.headerOverlay}` : styles.header}
    >
      <div className={styles.left}>
        <button
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <MenuIcon size={22} color="var(--cor-verde-escuro)" />
        </button>
        <Link href="/" className={styles.logoLink}>
          <Logo size={32} />
        </Link>
      </div>

      {!overlay && (
        <div className={styles.right}>
          <div className={styles.searchBox} aria-label="Campo de busca (visual)">
            <SearchIcon size={16} color="var(--cor-cinza)" />
            <span className={styles.searchPlaceholder}>Buscar por região ou crim...</span>
          </div>
        </div>
      )}
    </header>
  );
}
