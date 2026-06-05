"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo/Logo";
import { CloseIcon, HomeIcon, MapIcon, InfoIcon, ArrowRightIcon } from "@/components/icons";
import styles from "./Drawer.module.css";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/", label: "Início", Icon: HomeIcon },
  { href: "/mapa", label: "Mapa de risco", Icon: MapIcon },
  { href: "/sobre", label: "Sobre nós", Icon: InfoIcon },
];

export default function Drawer({ open, onClose }: DrawerProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel lateral */}
      <aside className={`${styles.panel} ${open ? styles.panelOpen : ""}`} aria-label="Menu de navegação">
        <div className={styles.panelHeader}>
          <Logo size={32} />
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar menu">
            <CloseIcon size={20} color="var(--cor-verde-escuro)" />
          </button>
        </div>

        <nav className={styles.nav}>
          <p className={styles.navLabel}>NAVEGAÇÃO</p>
          <ul className={styles.navList}>
            {navItems.map(({ href, label, Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                    onClick={onClose}
                  >
                    <span className={`${styles.iconBox} ${isActive ? styles.iconBoxActive : ""}`}>
                      <Icon size={18} color={isActive ? "var(--cor-branco)" : "var(--cor-verde)"} />
                    </span>
                    <span className={styles.navItemLabel}>{label}</span>
                    <ArrowRightIcon size={14} color="var(--cor-cinza)" className={styles.arrow} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className={styles.footer}>
          SafeStreets monitora ocorrências por Região Administrativa e gera resumos de risco com IA.
        </p>
      </aside>
    </>
  );
}
