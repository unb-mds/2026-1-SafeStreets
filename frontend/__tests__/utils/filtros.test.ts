import { noticias } from "@/utils/noticias";
import { REGIOES_ADMINISTRATIVAS, PERIODOS } from "@/utils/filtros";

describe("filtros data", () => {
  describe("REGIOES_ADMINISTRATIVAS", () => {
    it("should be a non-empty array of strings", () => {
      expect(Array.isArray(REGIOES_ADMINISTRATIVAS)).toBe(true);
      expect(REGIOES_ADMINISTRATIVAS.length).toBeGreaterThan(0);
      REGIOES_ADMINISTRATIVAS.forEach((regiao) => {
        expect(typeof regiao).toBe("string");
        expect(regiao.trim().length).toBeGreaterThan(0);
      });
    });

    it("should contain known regions referenced in noticias", () => {
      expect(REGIOES_ADMINISTRATIVAS).toContain("Ceilândia");
      expect(REGIOES_ADMINISTRATIVAS).toContain("Taguatinga");
    });

    it("should not contain duplicate regions (edge: deduplication)", () => {
      const unique = new Set(REGIOES_ADMINISTRATIVAS);
      expect(unique.size).toBe(REGIOES_ADMINISTRATIVAS.length);
    });

    it("should match exactly the set of regions present in noticias", () => {
      const regioesFromNoticias = new Set(noticias.map((n) => n.regiao));
      expect(new Set(REGIOES_ADMINISTRATIVAS)).toEqual(regioesFromNoticias);
    });
  });

  describe("PERIODOS", () => {
    it("should be a non-empty array of options with value and label", () => {
      expect(Array.isArray(PERIODOS)).toBe(true);
      expect(PERIODOS.length).toBeGreaterThan(0);
      PERIODOS.forEach((periodo) => {
        expect(typeof periodo.value).toBe("string");
        expect(periodo.value.trim().length).toBeGreaterThan(0);
        expect(typeof periodo.label).toBe("string");
        expect(periodo.label.trim().length).toBeGreaterThan(0);
      });
    });

    it("should not contain duplicate values (edge: deduplication)", () => {
      const values = PERIODOS.map((p) => p.value);
      expect(new Set(values).size).toBe(values.length);
    });
  });
});
