"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header/Header";
import Drawer from "@/components/Drawer/Drawer";
import Footer from "@/components/Footer/Footer";
import { useSearch } from "@/components/SearchProvider/SearchProvider";
import styles from "./Chrome.module.css";

interface ChromeProps {
  children: React.ReactNode;
}

export default function Chrome({ children }: ChromeProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const isMapRoute = pathname === "/mapa";
  const { query, setQuery } = useSearch();

  return (
    <>
      <Header
        onMenuClick={() => setDrawerOpen(true)}
        overlay={isMapRoute}
        searchQuery={query}
        onSearchChange={setQuery}
      />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className={isMapRoute ? styles.mainFullScreen : styles.main}>
        {children}
      </main>
      {!isMapRoute && <Footer />}
    </>
  );
}
