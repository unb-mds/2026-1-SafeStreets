import MapaInterativo from "@/components/MapaInterativo/MapaInterativo";
import PainelFiltros from "@/components/PainelFiltros/PainelFiltros";
import styles from "./Mapa.module.css";

export default function Mapa() {
  return (
    <div className={styles.page}>
      <MapaInterativo />
      <PainelFiltros />
    </div>
  );
}
