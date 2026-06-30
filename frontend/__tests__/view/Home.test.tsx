import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchProvider, useSearch } from "@/components/SearchProvider/SearchProvider";
import Header from "@/components/Header/Header";
import Home from "@/view/Home/Home";
import { fetchNoticias } from "@/utils/noticias";
import { noticiasFixture } from "../fixtures/noticias";

jest.mock("@/utils/noticias", () => ({
  ...jest.requireActual("@/utils/noticias"),
  fetchNoticias: jest.fn(),
}));

const mockFetchNoticias = fetchNoticias as jest.MockedFunction<typeof fetchNoticias>;

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
  beforeEach(() => {
    mockFetchNoticias.mockReset();
    mockFetchNoticias.mockResolvedValue(noticiasFixture);
  });

  describe("happy path", () => {
    it("exibe todas as notícias quando a busca está vazia", async () => {
      renderHome();
      await waitFor(() => {
        expect(screen.getByText(/Furtos a pedestres aumentam 14%/)).toBeInTheDocument();
      });
      expect(
        screen.getByText(/Ceilândia registra queda de 18%/)
      ).toBeInTheDocument();
    });

    it("filtra o feed pelo termo digitado no header", async () => {
      renderHome();
      await waitFor(() => {
        expect(screen.getByText(/Furtos a pedestres aumentam 14%/)).toBeInTheDocument();
      });
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
    it("mostra mensagem de vazio quando nenhuma notícia corresponde", async () => {
      renderHome();
      await waitFor(() => {
        expect(screen.getByText(/Furtos a pedestres aumentam 14%/)).toBeInTheDocument();
      });
      fireEvent.change(screen.getByRole("searchbox"), {
        target: { value: "termo-inexistente-xyz" },
      });
      expect(
        screen.getByText(/Nenhuma notícia encontrada/)
      ).toBeInTheDocument();
      expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });

    it("volta a exibir todas ao limpar a busca", async () => {
      renderHome();
      await waitFor(() => {
        expect(screen.getByText(/Furtos a pedestres aumentam 14%/)).toBeInTheDocument();
      });
      const input = screen.getByRole("searchbox");
      fireEvent.change(input, { target: { value: "Ceilândia" } });
      fireEvent.change(input, { target: { value: "" } });
      expect(screen.getByText(/Furtos a pedestres aumentam 14%/)).toBeInTheDocument();
      expect(
        screen.getByText(/Ceilândia registra queda de 18%/)
      ).toBeInTheDocument();
    });

    it("mostra estado de carregamento antes dos dados chegarem (edge)", () => {
      mockFetchNoticias.mockReturnValue(new Promise(() => {}));
      renderHome();
      expect(screen.getByText(/Carregando notícias/)).toBeInTheDocument();
    });

    it("trata falha na busca exibindo a mensagem de nenhuma notícia (edge)", async () => {
      mockFetchNoticias.mockRejectedValue(new Error("Falha de rede"));
      renderHome();
      await waitFor(() => {
        expect(screen.getByText(/Nenhuma notícia encontrada/)).toBeInTheDocument();
      });
    });
  });
});
