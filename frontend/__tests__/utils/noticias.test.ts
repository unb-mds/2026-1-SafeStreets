import { fetchNoticias, fetchNoticiaPorId } from "@/utils/noticias";

describe("noticias API client", () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    mockFetch.mockReset();
  });

  const apiOcorrenciaExemplo = {
    id: 42,
    titulo: "Ocorrência de teste",
    latitude: -15.7797,
    longitude: -47.9297,
    ra: "RA-I",
    regiao: "Plano Piloto",
    risco: "Alto",
    resumo: "Resumo da ocorrência de teste",
    resumo_status: "done",
    data: "01/01/2026",
    descricao_detalhada: "Detalhe completo da ocorrência.",
    fonte_url: "https://www.ssp.df.gov.br/noticia.html",
  };

  describe("fetchNoticias", () => {
    it("deve buscar notícias com sucesso e converter o formato da API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [apiOcorrenciaExemplo],
        }),
      });

      const resultado = await fetchNoticias();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/ocorrencias"),
        expect.anything()
      );

      expect(resultado).toHaveLength(1);
      expect(resultado[0]).toEqual({
        id: "42",
        titulo: "Ocorrência de teste",
        resumo: "Resumo da ocorrência de teste",
        regiao: "Plano Piloto",
        ra: "RA-I",
        data: "01/01/2026",
        fonte: "www.ssp.df.gov.br",
        corpo: ["Detalhe completo da ocorrência."],
        fonteUrl: "https://www.ssp.df.gov.br/noticia.html",
        risco: "Alto",
        lat: -15.7797,
        lng: -47.9297,
      });
    });

    it("deve propagar os parâmetros de busca corretos na URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [],
        }),
      });

      await fetchNoticias({
        regiao: "Gama",
        data_inicio: "2026-01-01",
        data_fim: "2026-01-07",
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const urlChamada = mockFetch.mock.calls[0][0] as string;
      expect(urlChamada).toContain("regiao=Gama");
      expect(urlChamada).toContain("data_inicio=2026-01-01");
      expect(urlChamada).toContain("data_fim=2026-01-07");
    });

    it("deve lançar erro caso a resposta não seja ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(fetchNoticias()).rejects.toThrow("Falha ao buscar ocorrências: 500");
    });
  });

  describe("fetchNoticiaPorId", () => {
    it("deve buscar uma única notícia por ID e convertê-la", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: apiOcorrenciaExemplo,
        }),
      });

      const resultado = await fetchNoticiaPorId("42");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/ocorrencias/42"),
        expect.anything()
      );
      expect(resultado).not.toBeNull();
      expect(resultado?.id).toBe("42");
    });

    it("deve retornar null caso o status seja 404", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const resultado = await fetchNoticiaPorId("999");
      expect(resultado).toBeNull();
    });

    it("deve lançar erro caso ocorra outra falha na requisição", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(fetchNoticiaPorId("42")).rejects.toThrow("Falha ao buscar ocorrência 42: 403");
    });
  });
});
