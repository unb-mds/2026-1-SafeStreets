"use client";

import { useState } from "react";
import Header from "@/components/Header/Header";
import Drawer from "@/components/Drawer/Drawer";
import Footer from "@/components/Footer/Footer";
import styles from "./Chrome.module.css";

interface ChromeProps {
  children: React.ReactNode;
}

export default function Chrome({ children }: ChromeProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
}
