import { noticias, type Noticia } from "./noticias";

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

const PERIODO_EM_DIAS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "3m": 90,
  "1y": 365,
};

export type FiltrosBusca = {
  regiao: string;
  periodo: string;
  busca: string;
};

export function algumFiltroAplicado(filtros: FiltrosBusca): boolean {
  return Boolean(filtros.regiao || filtros.periodo || filtros.busca.trim());
}

function parseDataBr(data: string): Date {
  const [dia, mes, ano] = data.split("/").map(Number);
  return new Date(ano, mes - 1, dia);
}

function dentroDoPeriodo(data: string, periodo: string): boolean {
  const dias = PERIODO_EM_DIAS[periodo];
  if (!dias) return true;

  const diffMs = Date.now() - parseDataBr(data).getTime();
  const diffDias = diffMs / (1000 * 60 * 60 * 24);
  return diffDias >= 0 && diffDias <= dias;
}

export function filtrarNoticias(lista: Noticia[], filtros: FiltrosBusca): Noticia[] {
  const busca = filtros.busca.trim().toLowerCase();

  return lista.filter((noticia) => {
    if (filtros.regiao && noticia.regiao !== filtros.regiao) return false;
    if (filtros.periodo && !dentroDoPeriodo(noticia.data, filtros.periodo)) return false;
    if (
      busca &&
      !noticia.titulo.toLowerCase().includes(busca) &&
      !noticia.resumo.toLowerCase().includes(busca) &&
      !noticia.regiao.toLowerCase().includes(busca)
    ) {
      return false;
    }
    return true;
  });
}
