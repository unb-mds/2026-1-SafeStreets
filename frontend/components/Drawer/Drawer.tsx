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

type NavItem = {
  href: string;
  label: string;
  Icon: typeof HomeIcon;
  external?: boolean;
};

const navItems: NavItem[] = [
  { href: "/", label: "Início", Icon: HomeIcon },
  { href: "/mapa", label: "Mapa de risco", Icon: MapIcon },
  {
    href: "https://unb-mds.github.io/2026-1-SafeStreets/",
    label: "Sobre nós",
    Icon: InfoIcon,
    external: true,
  },
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
            {navItems.map(({ href, label, Icon, external }) => {
              const isActive = !external && pathname === href;
              const content = (
                <>
                  <span className={`${styles.iconBox} ${isActive ? styles.iconBoxActive : ""}`}>
                    <Icon size={18} color={isActive ? "var(--cor-branco)" : "var(--cor-verde)"} />
                  </span>
                  <span className={styles.navItemLabel}>{label}</span>
                  <ArrowRightIcon size={14} color="var(--cor-cinza)" className={styles.arrow} />
                </>
              );
              return (
                <li key={href}>
                  {external ? (
                    <a
                      href={href}
                      className={styles.navItem}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                    >
                      {content}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                      onClick={onClose}
                    >
                      {content}
                    </Link>
                  )}
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
