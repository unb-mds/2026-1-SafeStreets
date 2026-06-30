import React from "react";
import { render, screen } from "@testing-library/react";
import NoticiaDetalhe from "@/view/NoticiaDetalhe/NoticiaDetalhe";
import type { Noticia } from "@/utils/noticias";

const noticia: Noticia = {
  id: "1",
  titulo: "Furtos a pedestres aumentam 14% na quadra comercial da 304 Sul",
  resumo: "Câmeras e patrulhamento a pé serão reforçados após série de ocorrências.",
  regiao: "Plano Piloto",
  ra: "RA-I",
  data: "02/06/2026",
  fonte: "Boletim de Segurança · SSP-DF",
  corpo: [
    "Primeiro parágrafo do detalhamento da ocorrência.",
    "Segundo parágrafo com mais contexto sobre o caso.",
  ],
  fonteUrl: "https://www.ssp.df.gov.br/",
  risco: "Médio",
  lat: -15.7942,
  lng: -47.8822,
};

describe("NoticiaDetalhe (RF02)", () => {
  describe("happy path", () => {
    it("renders the title as an h1", () => {
      render(<NoticiaDetalhe noticia={noticia} />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        noticia.titulo
      );
    });

    it("shows the publication date", () => {
      render(<NoticiaDetalhe noticia={noticia} />);
      expect(screen.getByText("02/06/2026")).toBeInTheDocument();
    });

    it("shows the associated location (região)", () => {
      render(<NoticiaDetalhe noticia={noticia} />);
      expect(screen.getByText("Plano Piloto")).toBeInTheDocument();
    });

    it("renders every body paragraph", () => {
      render(<NoticiaDetalhe noticia={noticia} />);
      noticia.corpo.forEach((paragrafo) => {
        expect(screen.getByText(paragrafo)).toBeInTheDocument();
      });
    });

    it("has a back link to the news feed", () => {
      render(<NoticiaDetalhe noticia={noticia} />);
      const voltar = screen.getByRole("link", { name: /Voltar para notícias/i });
      expect(voltar).toHaveAttribute("href", "/");
    });

    it("links to the original source in a new tab", () => {
      render(<NoticiaDetalhe noticia={noticia} />);
      const link = screen.getByRole("link", { name: /Abrir link/i });
      expect(link).toHaveAttribute("href", "https://www.ssp.df.gov.br/");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    });
  });

  describe("edge cases", () => {
    it("renders without crashing when corpo has a single paragraph", () => {
      const umParagrafo: Noticia = { ...noticia, corpo: ["Único parágrafo."] };
      render(<NoticiaDetalhe noticia={umParagrafo} />);
      expect(screen.getByText("Único parágrafo.")).toBeInTheDocument();
    });

    it("renders without crashing when corpo is empty (edge: no body)", () => {
      const semCorpo: Noticia = { ...noticia, corpo: [] };
      expect(() => render(<NoticiaDetalhe noticia={semCorpo} />)).not.toThrow();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("escapes unicode/special characters in the title (edge: XSS-adjacent)", () => {
      const xss: Noticia = { ...noticia, titulo: "<script>alert('x')</script>" };
      const { container } = render(<NoticiaDetalhe noticia={xss} />);
      expect(container.querySelector("script")).toBeNull();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "<script>alert('x')</script>"
      );
    });

    it("splits paragraphs at each period (.) and groups them into 2-sentence paragraphs, isolating captions and CTAs", () => {
      const multiSentencas: Noticia = {
        ...noticia,
        corpo: ["Primeira sentença. Reprodução Segunda sentença. Terceira. ✅ CTA link."],
      };
      render(<NoticiaDetalhe noticia={multiSentencas} />);
      expect(screen.getByText("Primeira sentença.")).toBeInTheDocument();
      expect(screen.getByText("Reprodução")).toBeInTheDocument();
      expect(screen.getByText("Segunda sentença. Terceira.")).toBeInTheDocument();
      expect(screen.getByText("✅ CTA link.")).toBeInTheDocument();
    });
  });
});
