import { noticias, type Noticia } from "@/utils/noticias";
import {
  REGIOES_ADMINISTRATIVAS,
  PERIODOS,
  algumFiltroAplicado,
  filtrarNoticias,
  type FiltrosBusca,
} from "@/utils/filtros";

const SEM_FILTRO: FiltrosBusca = { regiao: "", periodo: "", busca: "" };

function formatarDataBr(date: Date): string {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${date.getFullYear()}`;
}

function diasAtras(dias: number): string {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return formatarDataBr(data);
}

function criarNoticia(overrides: Partial<Noticia>): Noticia {
  return {
    id: "x",
    titulo: "Título de teste",
    resumo: "Resumo de teste",
    regiao: "Plano Piloto",
    ra: "RA-I",
    data: diasAtras(0),
    fonte: "Fonte de teste",
    risco: "Baixo",
    lat: -15.7797,
    lng: -47.9297,
    ...overrides,
  };
}

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

  describe("algumFiltroAplicado", () => {
    it("returns false when no filter is set", () => {
      expect(algumFiltroAplicado(SEM_FILTRO)).toBe(false);
    });

    it("returns true when regiao, periodo or busca is set", () => {
      expect(algumFiltroAplicado({ ...SEM_FILTRO, regiao: "Ceilândia" })).toBe(true);
      expect(algumFiltroAplicado({ ...SEM_FILTRO, periodo: "7d" })).toBe(true);
      expect(algumFiltroAplicado({ ...SEM_FILTRO, busca: "furto" })).toBe(true);
    });

    it("treats a busca with only whitespace as no filter (edge)", () => {
      expect(algumFiltroAplicado({ ...SEM_FILTRO, busca: "   " })).toBe(false);
    });
  });

  describe("filtrarNoticias", () => {
    it("returns the full list when no filter is applied", () => {
      expect(filtrarNoticias(noticias, SEM_FILTRO)).toEqual(noticias);
    });

    it("filters by regiao", () => {
      const resultado = filtrarNoticias(noticias, { ...SEM_FILTRO, regiao: "Ceilândia" });
      expect(resultado.length).toBeGreaterThan(0);
      resultado.forEach((n) => expect(n.regiao).toBe("Ceilândia"));
    });

    it("filters by free-text busca matching title, resumo or regiao (case-insensitive)", () => {
      const resultado = filtrarNoticias(noticias, { ...SEM_FILTRO, busca: "ceilândia" });
      expect(resultado.length).toBeGreaterThan(0);
      resultado.forEach((n) =>
        expect(
          n.titulo.toLowerCase().includes("ceilândia") ||
            n.resumo.toLowerCase().includes("ceilândia") ||
            n.regiao.toLowerCase().includes("ceilândia")
        ).toBe(true)
      );
    });

    it("combines regiao and busca by intersection", () => {
      const lista = [
        criarNoticia({ id: "a", regiao: "Ceilândia", titulo: "Roubo em Ceilândia" }),
        criarNoticia({ id: "b", regiao: "Ceilândia", titulo: "Furto em outra área" }),
        criarNoticia({ id: "c", regiao: "Gama", titulo: "Roubo no Gama" }),
      ];
      const resultado = filtrarNoticias(lista, { ...SEM_FILTRO, regiao: "Ceilândia", busca: "roubo" });
      expect(resultado.map((n) => n.id)).toEqual(["a"]);
    });

    it("returns an empty array when no item matches the combined filters (edge)", () => {
      const resultado = filtrarNoticias(noticias, { ...SEM_FILTRO, regiao: "Gama", busca: "ceilândia" });
      expect(resultado).toEqual([]);
    });

    it("filters out items outside the selected periodo window", () => {
      const lista = [
        criarNoticia({ id: "recente", data: diasAtras(1) }),
        criarNoticia({ id: "antigo", data: diasAtras(40) }),
      ];
      const resultado = filtrarNoticias(lista, { ...SEM_FILTRO, periodo: "7d" });
      expect(resultado.map((n) => n.id)).toEqual(["recente"]);
    });
  });
});
