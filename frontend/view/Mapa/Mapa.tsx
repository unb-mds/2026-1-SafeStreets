import MapaInterativo from "@/components/MapaInterativo/MapaInterativo";
import styles from "./Mapa.module.css";

export default function Mapa() {
  return (
    <div className={styles.page}>
      <MapaInterativo />
    </div>
  );
}
