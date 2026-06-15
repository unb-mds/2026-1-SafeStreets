import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchProvider, useSearch } from "@/components/SearchProvider/SearchProvider";
import Header from "@/components/Header/Header";
import Home from "@/view/Home/Home";

// Reproduz o wiring real (Chrome lê o contexto e o repassa ao Header) num
// harness enxuto, para testar a busca de ponta a ponta: Header → contexto →
// Home → NewsFeed.
function Harness() {
  const { query, setQuery } = useSearch();
  return (
    <>
      <Header
        onMenuClick={() => {}}
        searchQuery={query}
        onSearchChange={setQuery}
      />
      <Home />
    </>
  );
}

function renderHome() {
  return render(
    <SearchProvider>
      <Harness />
    </SearchProvider>
  );
}

describe("Home — busca funcional (RF08)", () => {
  describe("happy path", () => {
    it("exibe todas as notícias quando a busca está vazia", () => {
      renderHome();
      expect(screen.getByText(/Furtos a pedestres aumentam 14%/)).toBeInTheDocument();
      expect(
        screen.getByText(/Ceilândia registra queda de 18%/)
      ).toBeInTheDocument();
    });

    it("filtra o feed pelo termo digitado no header", () => {
      renderHome();
      fireEvent.change(screen.getByRole("searchbox"), {
        target: { value: "Ceilândia" },
      });
      expect(
        screen.getByText(/Ceilândia registra queda de 18%/)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Furtos a pedestres aumentam 14%/)
      ).not.toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("mostra mensagem de vazio quando nenhuma notícia corresponde", () => {
      renderHome();
      fireEvent.change(screen.getByRole("searchbox"), {
        target: { value: "termo-inexistente-xyz" },
      });
      expect(
        screen.getByText(/Nenhuma notícia encontrada/)
      ).toBeInTheDocument();
      expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });

    it("volta a exibir todas ao limpar a busca", () => {
      renderHome();
      const input = screen.getByRole("searchbox");
      fireEvent.change(input, { target: { value: "Ceilândia" } });
      fireEvent.change(input, { target: { value: "" } });
      expect(screen.getByText(/Furtos a pedestres aumentam 14%/)).toBeInTheDocument();
      expect(
        screen.getByText(/Ceilândia registra queda de 18%/)
      ).toBeInTheDocument();
    });
  });
});
