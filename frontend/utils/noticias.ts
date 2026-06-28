const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Risco = "Alto" | "Médio" | "Baixo";

export type Noticia = {
  id: string;
  titulo: string;
  resumo: string;
  regiao: string;
  ra: string;
  data: string;
  fonte: string;
  corpo: string[]; // parágrafos da descrição detalhada (RF02)
  fonteUrl: string; // link original da fonte de dados (RF02)
  risco: Risco;
  lat: number;
  lng: number;
};

// Formato exato do JSON retornado pela API (OcorrenciaOut)
type ApiOcorrencia = {
  id: number;
  titulo: string;
  latitude: number;
  longitude: number;
  ra: string | null;
  regiao: string | null;
  risco: string | null;
  resumo: string | null;
  resumo_status: string | null;
  data: string | null;
  descricao_detalhada: string | null;
  fonte_url: string | null;
};

/** Converte o objeto da API para o tipo Noticia esperado pelos componentes. */
function toNoticia(o: ApiOcorrencia): Noticia {
  // Deriva o label "hostname" da fonte a partir da URL (ex: "www.ssp.df.gov.br")
  let fonte = "";
  if (o.fonte_url) {
    try {
      fonte = new URL(o.fonte_url).hostname;
    } catch {
      fonte = o.fonte_url;
    }
  }

  return {
    id: String(o.id),
    titulo: o.titulo ?? "",
    resumo: o.resumo ?? "",
    regiao: o.regiao ?? o.ra ?? "",
    ra: o.ra ?? "",
    data: o.data ?? "",
    fonte,
    corpo: o.descricao_detalhada ? [o.descricao_detalhada] : [],
    fonteUrl: o.fonte_url ?? "",
    risco: (o.risco as Risco) ?? "Baixo",
    lat: o.latitude,
    lng: o.longitude,
  };
}

/**
 * Busca a lista de ocorrências na API.
 * Aceita filtros opcionais de região e período (passados como query params).
 */
export async function fetchNoticias(params?: {
  regiao?: string;
  data_inicio?: string;
  data_fim?: string;
}): Promise<Noticia[]> {
  const url = new URL(`${API_URL}/ocorrencias`);
  if (params?.regiao) url.searchParams.set("regiao", params.regiao);
  if (params?.data_inicio) url.searchParams.set("data_inicio", params.data_inicio);
  if (params?.data_fim) url.searchParams.set("data_fim", params.data_fim);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Falha ao buscar ocorrências: ${res.status}`);
  const json = await res.json();
  return (json.data as ApiOcorrencia[]).map(toNoticia);
}

/**
 * Busca uma única ocorrência pelo id numérico (string porque o frontend usa string).
 * Retorna null se não encontrada (404).
 */
export async function fetchNoticiaPorId(id: string): Promise<Noticia | null> {
  const res = await fetch(`${API_URL}/ocorrencias/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Falha ao buscar ocorrência ${id}: ${res.status}`);
  const json = await res.json();
  return toNoticia(json.data as ApiOcorrencia);
}
