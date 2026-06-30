import { fetchNoticias, fetchNoticiaPorId } from "@/utils/noticias";

/**
 * Reescrito após a migração de `utils/noticias.ts` de um array mockado
 * estático (`noticias`/`getNoticiaPorId`) para chamadas reais à API
 * (`fetchNoticias`/`fetchNoticiaPorId`). Aqui mockamos `global.fetch` para
 * validar o mapeamento `ApiOcorrencia -> Noticia` e os contratos de erro,
 * sem depender do backend rodando.
 */

const apiOcorrencia = {
  id: 1,
  titulo: "Furtos a pedestres aumentam 14% na quadra comercial da 304 Sul",
  latitude: -15.7942,
  longitude: -47.8822,
  ra: "RA-I",
  regiao: "Plano Piloto",
  risco: "Médio",
  resumo: "Câmeras e patrulhamento a pé serão reforçados.",
  resumo_status: "COMPLETO",
  data: "02/06/2026",
  descricao_detalhada: "Texto detalhado da ocorrência.",
  fonte_url: "https://www.ssp.df.gov.br/noticia/1",
};

function mockFetchOnce(body: unknown, init?: { ok?: boolean; status?: number }) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: async () => body,
  });
}

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("fetchNoticias", () => {
  it("maps the API response into Noticia objects (happy path)", async () => {
    mockFetchOnce({ success: true, data: [apiOcorrencia] });

    const resultado = await fetchNoticias();

    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toMatchObject({
      id: "1",
      titulo: apiOcorrencia.titulo,
      resumo: apiOcorrencia.resumo,
      regiao: "Plano Piloto",
      ra: "RA-I",
      data: "02/06/2026",
      fonte: "www.ssp.df.gov.br",
      corpo: ["Texto detalhado da ocorrência."],
      fonteUrl: apiOcorrencia.fonte_url,
      risco: "Médio",
      lat: -15.7942,
      lng: -47.8822,
    });
  });

  it("falls back regiao to ra and risco to Baixo when missing (edge)", async () => {
    mockFetchOnce({
      success: true,
      data: [{ ...apiOcorrencia, regiao: null, risco: null }],
    });

    const [noticia] = await fetchNoticias();
    expect(noticia.regiao).toBe("RA-I");
    expect(noticia.risco).toBe("Baixo");
  });

  it("returns an empty corpo when descricao_detalhada is missing (edge)", async () => {
    mockFetchOnce({
      success: true,
      data: [{ ...apiOcorrencia, descricao_detalhada: null }],
    });

    const [noticia] = await fetchNoticias();
    expect(noticia.corpo).toEqual([]);
  });

  it("appends regiao/data_inicio/data_fim as query params when provided", async () => {
    mockFetchOnce({ success: true, data: [] });

    await fetchNoticias({ regiao: "Ceilândia", data_inicio: "2026-05-01", data_fim: "2026-06-01" });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    const url = new URL(calledUrl);
    expect(url.pathname).toBe("/ocorrencias");
    expect(url.searchParams.get("regiao")).toBe("Ceilândia");
    expect(url.searchParams.get("data_inicio")).toBe("2026-05-01");
    expect(url.searchParams.get("data_fim")).toBe("2026-06-01");
  });

  it("throws when the API responds with a non-ok status (edge)", async () => {
    mockFetchOnce({}, { ok: false, status: 503 });
    await expect(fetchNoticias()).rejects.toThrow("Falha ao buscar ocorrências: 503");
  });
});

describe("fetchNoticiaPorId", () => {
  it("returns the mapped Noticia for an existing id (happy path)", async () => {
    mockFetchOnce({ success: true, data: apiOcorrencia });

    const noticia = await fetchNoticiaPorId("1");
    expect(noticia?.id).toBe("1");
    expect(noticia?.titulo).toBe(apiOcorrencia.titulo);
  });

  it("returns null for a 404 (edge: not found)", async () => {
    mockFetchOnce({}, { ok: false, status: 404 });
    const noticia = await fetchNoticiaPorId("id-inexistente");
    expect(noticia).toBeNull();
  });

  it("throws for other non-ok statuses (edge)", async () => {
    mockFetchOnce({}, { ok: false, status: 500 });
    await expect(fetchNoticiaPorId("1")).rejects.toThrow("Falha ao buscar ocorrência 1: 500");
  });
});
