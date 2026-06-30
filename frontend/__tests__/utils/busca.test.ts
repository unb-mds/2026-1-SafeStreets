import { filtrarNoticias } from "@/utils/busca";
import type { Noticia } from "@/utils/noticias";

const makeNoticia = (over: Partial<Noticia>): Noticia => ({
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
  ...over,
});

const lista: Noticia[] = [
  makeNoticia({
    id: "1",
    titulo: "Furtos a pedestres aumentam na 304 Sul",
    regiao: "Plano Piloto",
    fonte: "Boletim de Segurança · SSP-DF",
  }),
  makeNoticia({
    id: "2",
    titulo: "Operação reduz roubo de veículos",
    resumo: "Força-tarefa recuperou 23 carros.",
    regiao: "Taguatinga",
    fonte: "Nota oficial · PMDF",
  }),
  makeNoticia({
    id: "3",
    titulo: "Queda nos crimes violentos",
    regiao: "Ceilândia",
    fonte: "Relatório Mensal · PCDF",
  }),
];

describe("filtrarNoticias", () => {
  describe("happy path", () => {
    it("retorna a lista completa quando o termo é vazio", () => {
      expect(filtrarNoticias(lista, "")).toEqual(lista);
    });

    it("filtra por região (case-insensitive)", () => {
      const resultado = filtrarNoticias(lista, "taguatinga");
      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe("2");
    });

    it("filtra por palavra no título", () => {
      const resultado = filtrarNoticias(lista, "Furtos");
      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe("1");
    });

    it("filtra por trecho do resumo", () => {
      const resultado = filtrarNoticias(lista, "recuperou 23");
      expect(resultado.map((n) => n.id)).toEqual(["2"]);
    });

    it("filtra por fonte", () => {
      const resultado = filtrarNoticias(lista, "PCDF");
      expect(resultado.map((n) => n.id)).toEqual(["3"]);
    });

    it("ignora acentos no termo e no conteúdo (Ceilândia ~ ceilandia)", () => {
      const resultado = filtrarNoticias(lista, "ceilandia");
      expect(resultado.map((n) => n.id)).toEqual(["3"]);
    });
  });

  describe("edge cases", () => {
    it("retorna a lista completa quando o termo é só espaços", () => {
      expect(filtrarNoticias(lista, "   ")).toEqual(lista);
    });

    it("retorna lista vazia quando nada corresponde", () => {
      expect(filtrarNoticias(lista, "xyznãoexiste")).toEqual([]);
    });

    it("retorna lista vazia ao filtrar uma lista vazia", () => {
      expect(filtrarNoticias([], "qualquer")).toEqual([]);
    });

    it("não muta a lista original", () => {
      const copia = [...lista];
      filtrarNoticias(lista, "taguatinga");
      expect(lista).toEqual(copia);
    });

    it("ignora espaços nas extremidades do termo", () => {
      const resultado = filtrarNoticias(lista, "  taguatinga  ");
      expect(resultado.map((n) => n.id)).toEqual(["2"]);
    });
  });
});
