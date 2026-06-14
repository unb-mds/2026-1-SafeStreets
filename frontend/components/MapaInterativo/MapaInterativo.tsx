"use client";

import dynamic from "next/dynamic";
import styles from "./MapaInterativo.module.css";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
});

export default function MapaInterativo() {
  return (
    <div className={styles.container}>
      <MapView />
    </div>
  );
}
