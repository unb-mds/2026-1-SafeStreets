import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchProvider, useSearch } from "@/components/SearchProvider/SearchProvider";
import Header from "@/components/Header/Header";
import Home from "@/view/Home/Home";
import { fetchNoticias, type Noticia } from "@/utils/noticias";

jest.mock("@/utils/noticias", () => ({
  fetchNoticias: jest.fn(),
}));

const mockFetchNoticias = fetchNoticias as jest.Mock;

const mockNoticias: Noticia[] = [
  {
    id: "1",
    titulo: "Furtos a pedestres aumentam 14% na quadra comercial da 304 Sul",
    resumo: "Câmeras e patrulhamento a pé serão reforçados após série de ocorrências.",
    regiao: "Plano Piloto",
    ra: "RA-I",
    data: "02/06/2026",
    fonte: "Boletim de Segurança · SSP-DF",
    corpo: ["Primeiro parágrafo de teste."],
    fonteUrl: "https://www.ssp.df.gov.br/",
    risco: "Médio",
    lat: -15.7942,
    lng: -47.8822,
  },
  {
    id: "3",
    titulo: "Ceilândia registra queda de 18% nos crimes violentos no mês de maio",
    resumo: "Delegacia especializada atribui resultado ao aumento do efetivo.",
    regiao: "Ceilândia",
    ra: "RA-IX",
    data: "31/05/2026",
    fonte: "Relatório Mensal · PCDF",
    corpo: ["Primeiro parágrafo de teste."],
    fonteUrl: "https://www.pcdf.df.gov.br/",
    risco: "Baixo",
    lat: -15.815,
    lng: -48.114,
  },
];

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
    mockFetchNoticias.mockResolvedValue(mockNoticias);
  });

  describe("happy path", () => {
    it("exibe todas as notícias quando a busca está vazia", async () => {
      renderHome();
      expect(await screen.findByText(/Furtos a pedestres aumentam 14%/)).toBeInTheDocument();
      expect(
        await screen.findByText(/Ceilândia registra queda de 18%/)
      ).toBeInTheDocument();
    });

    it("filtra o feed pelo termo digitado no header", async () => {
      renderHome();
      const input = await screen.findByRole("searchbox");
      fireEvent.change(input, {
        target: { value: "Ceilândia" },
      });
      expect(
        await screen.findByText(/Ceilândia registra queda de 18%/)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Furtos a pedestres aumentam 14%/)
      ).not.toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("mostra mensagem de vazio quando nenhuma notícia corresponde", async () => {
      renderHome();
      const input = await screen.findByRole("searchbox");
      fireEvent.change(input, {
        target: { value: "termo-inexistente-xyz" },
      });
      expect(
        await screen.findByText(/Nenhuma notícia encontrada/)
      ).toBeInTheDocument();
      expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });

    it("volta a exibir todas ao limpar a busca", async () => {
      renderHome();
      const input = await screen.findByRole("searchbox");
      fireEvent.change(input, { target: { value: "Ceilândia" } });
      expect(await screen.findByText(/Ceilândia registra queda de 18%/)).toBeInTheDocument();
      
      fireEvent.change(input, { target: { value: "" } });
      
      expect(await screen.findByText(/Furtos a pedestres aumentam 14%/)).toBeInTheDocument();
      expect(
        await screen.findByText(/Ceilândia registra queda de 18%/)
      ).toBeInTheDocument();
    });
  });
});
