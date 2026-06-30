import type { Noticia } from "@/utils/noticias";
import {
  PERIODOS,
  algumFiltroAplicado,
  filtrarNoticias,
  getRegioes,
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
    corpo: ["Parágrafo de teste."],
    fonteUrl: "https://www.ssp.df.gov.br/",
    ...overrides,
  };
}

const mockNoticias: Noticia[] = [
  criarNoticia({ id: "1", regiao: "Plano Piloto", titulo: "Furtos a pedestres" }),
  criarNoticia({ id: "2", regiao: "Taguatinga", titulo: "Operação Taguatinga" }),
  criarNoticia({ id: "3", regiao: "Ceilândia", titulo: "Crimes violentos" }),
];

describe("filtros data", () => {
  describe("getRegioes", () => {
    it("should return a non-empty array of strings when given noticias", () => {
      const regioes = getRegioes(mockNoticias);
      expect(Array.isArray(regioes)).toBe(true);
      expect(regioes.length).toBeGreaterThan(0);
      regioes.forEach((regiao: string) => {
        expect(typeof regiao).toBe("string");
        expect(regiao.trim().length).toBeGreaterThan(0);
      });
    });

    it("should contain regions present in given noticias", () => {
      const regioes = getRegioes(mockNoticias);
      expect(regioes).toContain("Ceilândia");
      expect(regioes).toContain("Taguatinga");
    });

    it("should return sorted and unique regions", () => {
      const duplicatedNoticias = [
        criarNoticia({ regiao: "Taguatinga" }),
        criarNoticia({ regiao: "Ceilândia" }),
        criarNoticia({ regiao: "Taguatinga" }),
      ];
      const regioes = getRegioes(duplicatedNoticias);
      expect(regioes).toEqual(["Ceilândia", "Taguatinga"]);
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
      expect(filtrarNoticias(mockNoticias, SEM_FILTRO)).toEqual(mockNoticias);
    });

    it("filters by regiao", () => {
      const resultado = filtrarNoticias(mockNoticias, { ...SEM_FILTRO, regiao: "Ceilândia" });
      expect(resultado.length).toBeGreaterThan(0);
      resultado.forEach((n: Noticia) => expect(n.regiao).toBe("Ceilândia"));
    });

    it("filters by free-text busca matching title, resumo or regiao (case-insensitive)", () => {
      const resultado = filtrarNoticias(mockNoticias, { ...SEM_FILTRO, busca: "ceilândia" });
      expect(resultado.length).toBeGreaterThan(0);
      resultado.forEach((n: Noticia) =>
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
      expect(resultado.map((n: Noticia) => n.id)).toEqual(["a"]);
    });

    it("returns an empty array when no item matches the combined filters (edge)", () => {
      const resultado = filtrarNoticias(mockNoticias, { ...SEM_FILTRO, regiao: "Gama", busca: "ceilândia" });
      expect(resultado).toEqual([]);
    });

    it("filters out items outside the selected periodo window", () => {
      const lista = [
        criarNoticia({ id: "recente", data: diasAtras(1) }),
        criarNoticia({ id: "antigo", data: diasAtras(40) }),
      ];
      const resultado = filtrarNoticias(lista, { ...SEM_FILTRO, periodo: "7d" });
      expect(resultado.map((n: Noticia) => n.id)).toEqual(["recente"]);
    });
  });
});
