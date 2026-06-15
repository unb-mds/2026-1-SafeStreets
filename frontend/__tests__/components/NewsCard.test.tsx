import React from "react";
import { render, screen } from "@testing-library/react";
import NewsCard from "@/components/NewsCard/NewsCard";
import type { Noticia } from "@/utils/noticias";

const baseNoticia: Noticia = {
  id: "1",
  titulo: "Furtos aumentam no centro",
  resumo: "Câmeras serão reforçadas após série de ocorrências.",
  regiao: "Plano Piloto",
  ra: "RA-I",
  data: "02/06/2026",
  fonte: "SSP-DF",
  risco: "Médio",
  lat: -15.7942,
  lng: -47.8822,
};

describe("NewsCard", () => {
  describe("happy path", () => {
    it("renders the article title in an h2", () => {
      render(<NewsCard noticia={baseNoticia} />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Furtos aumentam no centro");
    });

    it("renders the resumo paragraph", () => {
      render(<NewsCard noticia={baseNoticia} />);
      expect(
        screen.getByText("Câmeras serão reforçadas após série de ocorrências.")
      ).toBeInTheDocument();
    });

    it("displays the regiao badge", () => {
      render(<NewsCard noticia={baseNoticia} />);
      expect(screen.getByText("Plano Piloto")).toBeInTheDocument();
    });

    it("displays the date", () => {
      render(<NewsCard noticia={baseNoticia} />);
      expect(screen.getByText("02/06/2026")).toBeInTheDocument();
    });

    it("displays the fonte", () => {
      render(<NewsCard noticia={baseNoticia} />);
      expect(screen.getByText("SSP-DF")).toBeInTheDocument();
    });

    it("renders the 'Ler notícia' call-to-action", () => {
      render(<NewsCard noticia={baseNoticia} />);
      expect(screen.getByText(/Ler notícia/)).toBeInTheDocument();
    });

    it("renders an article element", () => {
      const { container } = render(<NewsCard noticia={baseNoticia} />);
      expect(container.querySelector("article")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("renders with a very long title without crashing (edge: overflow)", () => {
      const longtitle = "A".repeat(300);
      const noticia: Noticia = { ...baseNoticia, titulo: longtitle };
      render(<NewsCard noticia={noticia} />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        longtitle
      );
    });

    it("renders with special/unicode characters in titulo (edge: XSS-adjacent)", () => {
      const noticia: Noticia = {
        ...baseNoticia,
        titulo: "<script>alert('xss')</script>",
      };
      const { container } = render(<NewsCard noticia={noticia} />);
      // React should escape this — no actual script tag in DOM
      expect(container.querySelector("script")).toBeNull();
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "<script>alert('xss')</script>"
      );
    });

    it("renders with a single-character titulo (edge: minimum content)", () => {
      const noticia: Noticia = { ...baseNoticia, titulo: "X" };
      render(<NewsCard noticia={noticia} />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("X");
    });

    it("renders correctly when fonte contains bullet separator (edge: composite string)", () => {
      const noticia: Noticia = {
        ...baseNoticia,
        fonte: "Boletim de Segurança · SSP-DF",
      };
      render(<NewsCard noticia={noticia} />);
      expect(
        screen.getByText("Boletim de Segurança · SSP-DF")
      ).toBeInTheDocument();
    });

    it("renders correctly when regiao has accented characters (edge: UTF-8)", () => {
      const noticia: Noticia = { ...baseNoticia, regiao: "Ceilândia" };
      render(<NewsCard noticia={noticia} />);
      expect(screen.getByText("Ceilândia")).toBeInTheDocument();
    });

    it("renders the image placeholder section (edge: missing img graceful degradation)", () => {
      const { container } = render(<NewsCard noticia={baseNoticia} />);
      const imagePlaceholder = container.querySelector(
        "[aria-hidden='true']"
      );
      expect(imagePlaceholder).toBeInTheDocument();
    });
  });
});
