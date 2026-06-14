import React from "react";
import { render, screen } from "@testing-library/react";
import NewsFeed from "@/components/NewsFeed/NewsFeed";
import type { Noticia } from "@/utils/noticias";

const makeNoticia = (id: string): Noticia => ({
  id,
  titulo: `Notícia ${id}`,
  resumo: `Resumo da notícia ${id}.`,
  regiao: `Região ${id}`,
  ra: "RA-I",
  data: "01/01/2026",
  fonte: "Fonte Teste",
  corpo: [`Corpo da notícia ${id}.`],
  fonteUrl: "https://exemplo.df.gov.br/",
});

describe("NewsFeed", () => {
  describe("happy path", () => {
    it("renders a section element", () => {
      const { container } = render(<NewsFeed noticias={[makeNoticia("1")]} />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("renders the 'Notícias' section title", () => {
      render(<NewsFeed noticias={[makeNoticia("1")]} />);
      expect(
        screen.getByRole("heading", { name: /Notícias/i })
      ).toBeInTheDocument();
    });

    it("renders the correct number of NewsCards for a list of 3", () => {
      const list = [makeNoticia("1"), makeNoticia("2"), makeNoticia("3")];
      render(<NewsFeed noticias={list} />);
      const articles = screen.getAllByRole("article");
      expect(articles).toHaveLength(3);
    });

    it("shows the counter matching the number of articles", () => {
      const list = [makeNoticia("1"), makeNoticia("2")];
      render(<NewsFeed noticias={list} />);
      expect(screen.getByText("2 recentes")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("renders with an empty array without crashing (edge: zero items)", () => {
      expect(() => render(<NewsFeed noticias={[]} />)).not.toThrow();
    });

    it("shows counter '0 recentes' for an empty list (edge: zero count)", () => {
      render(<NewsFeed noticias={[]} />);
      expect(screen.getByText("0 recentes")).toBeInTheDocument();
    });

    it("renders exactly one NewsCard for a single-item list (edge: singleton)", () => {
      render(<NewsFeed noticias={[makeNoticia("1")]} />);
      const articles = screen.getAllByRole("article");
      expect(articles).toHaveLength(1);
    });

    it("shows counter '1 recentes' for a single item (edge: singular vs plural)", () => {
      render(<NewsFeed noticias={[makeNoticia("1")]} />);
      expect(screen.getByText("1 recentes")).toBeInTheDocument();
    });

    it("renders 100 cards without crashing (edge: large list)", () => {
      const large = Array.from({ length: 100 }, (_, i) =>
        makeNoticia(String(i))
      );
      expect(() => render(<NewsFeed noticias={large} />)).not.toThrow();
      expect(screen.getByText("100 recentes")).toBeInTheDocument();
    });

    it("renders each article title from the list (edge: order/data integrity)", () => {
      const list = [makeNoticia("A"), makeNoticia("B"), makeNoticia("C")];
      render(<NewsFeed noticias={list} />);
      expect(screen.getByText("Notícia A")).toBeInTheDocument();
      expect(screen.getByText("Notícia B")).toBeInTheDocument();
      expect(screen.getByText("Notícia C")).toBeInTheDocument();
    });
  });
});
