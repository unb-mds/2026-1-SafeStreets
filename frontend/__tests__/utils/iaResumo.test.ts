import type { Noticia } from "@/utils/noticias";
import { gerarResumoIA } from "@/utils/iaResumo";

const makeNoticia = (overrides: Partial<Noticia>): Noticia => ({
  id: "1",
  titulo: "Título padrão",
  resumo: "Resumo padrão",
  regiao: "Plano Piloto",
  ra: "RA-I",
  data: "01/01/2026",
  fonte: "SSP-DF",
  corpo: ["Parágrafo padrão."],
  fonteUrl: "https://exemplo.df.gov.br/",
  risco: "Baixo",
  lat: -15.7797,
  lng: -47.9297,
  ...overrides,
});

describe("gerarResumoIA", () => {
  it("resolves with a summary string for a regular noticia", async () => {
    const noticia = makeNoticia({ resumo: "Resumo gerado com IA" });
    const resumo = await gerarResumoIA(noticia);
    expect(typeof resumo).toBe("string");
    expect(resumo).toBe("Resumo gerado com IA");
  });

  it("rejects when the AI summary is unavailable for the noticia", async () => {
    const noticia = makeNoticia({ resumo: "" });
    await expect(gerarResumoIA(noticia)).rejects.toThrow();
  });
});
