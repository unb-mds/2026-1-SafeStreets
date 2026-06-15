import { noticias, getNoticiaPorId, type Noticia } from "@/utils/noticias";

describe("noticias data", () => {
  describe("array structure", () => {
    it("should export a non-empty array", () => {
      expect(Array.isArray(noticias)).toBe(true);
      expect(noticias.length).toBeGreaterThan(0);
    });

    it("should have at least 6 articles", () => {
      expect(noticias.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("Noticia fields", () => {
    it("should have all required fields on every item", () => {
      const requiredFields: Array<"id" | "titulo" | "resumo" | "regiao" | "ra" | "data" | "fonte"> = [
        "id",
        "titulo",
        "resumo",
        "regiao",
        "ra",
        "data",
        "fonte",
      ];

      noticias.forEach((n) => {
        requiredFields.forEach((field) => {
          expect(n).toHaveProperty(field);
          expect(typeof n[field]).toBe("string");
          expect(n[field].trim().length).toBeGreaterThan(0);
        });
      });
    });

    it("should reject articles with empty strings (edge: empty string vs missing)", () => {
      // Verifica que nenhum campo está em branco (string vazia ou só espaços)
      noticias.forEach((n) => {
        expect(n.id.trim()).not.toBe("");
        expect(n.titulo.trim()).not.toBe("");
        expect(n.resumo.trim()).not.toBe("");
        expect(n.regiao.trim()).not.toBe("");
        expect(n.ra.trim()).not.toBe("");
        expect(n.data.trim()).not.toBe("");
        expect(n.fonte.trim()).not.toBe("");
      });
    });

    it("should have a non-empty corpo (array of paragraphs) on every item (RF02)", () => {
      noticias.forEach((n) => {
        expect(Array.isArray(n.corpo)).toBe(true);
        expect(n.corpo.length).toBeGreaterThan(0);
        n.corpo.forEach((paragrafo) => {
          expect(typeof paragrafo).toBe("string");
          expect(paragrafo.trim().length).toBeGreaterThan(0);
        });
      });
    });

    it("should have a valid http(s) fonteUrl on every item (RF02)", () => {
      noticias.forEach((n) => {
        expect(typeof n.fonteUrl).toBe("string");
        expect(n.fonteUrl).toMatch(/^https?:\/\/.+/);
      });
    });
  });

  describe("getNoticiaPorId", () => {
    it("returns the matching notícia for an existing id (happy path)", () => {
      const primeira = noticias[0];
      const encontrada = getNoticiaPorId(primeira.id);
      expect(encontrada).toBeDefined();
      expect(encontrada?.id).toBe(primeira.id);
      expect(encontrada?.titulo).toBe(primeira.titulo);
    });

    it("returns undefined for an unknown id (edge: not found)", () => {
      expect(getNoticiaPorId("id-inexistente")).toBeUndefined();
    });

    it("returns undefined for an empty id (edge: empty string)", () => {
      expect(getNoticiaPorId("")).toBeUndefined();
    });
  });

  describe("id uniqueness", () => {
    it("should have unique ids across all articles", () => {
      const ids = noticias.map((n) => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(noticias.length);
    });

    it("should not have empty or whitespace-only ids (edge: id collision risk)", () => {
      noticias.forEach((n) => {
        expect(n.id.trim()).not.toBe("");
      });
    });
  });

  describe("data (date) format", () => {
    it("should match DD/MM/YYYY format for all articles", () => {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      noticias.forEach((n) => {
        expect(n.data).toMatch(dateRegex);
      });
    });

    it("should have valid calendar values (edge: day/month out of range)", () => {
      noticias.forEach((n) => {
        const [day, month] = n.data.split("/").map(Number);
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThanOrEqual(31);
        expect(month).toBeGreaterThanOrEqual(1);
        expect(month).toBeLessThanOrEqual(12);
      });
    });
  });

  describe("ra (administrative region code)", () => {
    it("should follow RA-<roman> pattern for all articles", () => {
      const raRegex = /^RA-[IVXLCDM]+$/;
      noticias.forEach((n) => {
        expect(n.ra).toMatch(raRegex);
      });
    });

    it("should not accept lowercase ra codes (edge: case sensitivity)", () => {
      noticias.forEach((n) => {
        expect(n.ra).toBe(n.ra.toUpperCase());
      });
    });
  });
});
