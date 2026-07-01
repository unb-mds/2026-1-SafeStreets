import { noticiasFixture } from "../fixtures/noticias";
import { gerarResumoIA } from "@/utils/iaResumo";
import { fetchNoticiaPorId } from "@/utils/noticias";

// Resumo é SOB DEMANDA: quando a notícia não tem resumo (PENDENTE), gerarResumoIA
// busca o detalhe (GET /ocorrencias/{id}), que faz o backend gerar e cachear.
jest.mock("@/utils/noticias", () => ({
  fetchNoticiaPorId: jest.fn(),
}));

const mockFetchPorId = fetchNoticiaPorId as jest.MockedFunction<typeof fetchNoticiaPorId>;

describe("gerarResumoIA (sob demanda)", () => {
  beforeEach(() => {
    mockFetchPorId.mockReset();
  });

  it("usa o resumo já presente (cache) sem buscar o detalhe", async () => {
    const noticia = { ...noticiasFixture[0], resumo: "Resumo em cache." };
    const resumo = await gerarResumoIA(noticia);
    expect(resumo).toBe("Resumo em cache.");
    expect(mockFetchPorId).not.toHaveBeenCalled();
  });

  it("busca o detalhe (gera sob demanda) quando o resumo está pendente", async () => {
    const noticia = { ...noticiasFixture[0], resumo: "" };
    mockFetchPorId.mockResolvedValue({ ...noticia, resumo: "Resumo gerado sob demanda." });

    const resumo = await gerarResumoIA(noticia);

    expect(resumo).toBe("Resumo gerado sob demanda.");
    expect(mockFetchPorId).toHaveBeenCalledWith(noticia.id);
  });

  it("rejeita quando nem o detalhe tem resumo disponível (edge)", async () => {
    const noticia = { ...noticiasFixture[0], resumo: "" };
    mockFetchPorId.mockResolvedValue({ ...noticia, resumo: "" });

    await expect(gerarResumoIA(noticia)).rejects.toThrow();
  });
});
