import { noticiasFixture } from "../fixtures/noticias";
import { gerarResumoIA } from "@/utils/iaResumo";

describe("gerarResumoIA", () => {
  it("resolves with a summary string for a regular noticia", async () => {
    const noticia = noticiasFixture.find((n) => n.id === "1")!;
    const resumo = await gerarResumoIA(noticia);
    expect(typeof resumo).toBe("string");
    expect(resumo.length).toBeGreaterThan(0);
  });

  it("rejects when the AI summary is unavailable for the noticia (edge: empty resumo)", async () => {
    const noticia = { ...noticiasFixture[0], resumo: "" };
    await expect(gerarResumoIA(noticia)).rejects.toThrow();
  });
});
