import { noticias } from "./noticias";

export const REGIOES_ADMINISTRATIVAS: string[] = Array.from(
  new Set(noticias.map((noticia) => noticia.regiao))
).sort((a, b) => a.localeCompare(b));

export type Periodo = {
  value: string;
  label: string;
};

export const PERIODOS: Periodo[] = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "3m", label: "Últimos 3 meses" },
  { value: "1y", label: "Último ano" },
];
