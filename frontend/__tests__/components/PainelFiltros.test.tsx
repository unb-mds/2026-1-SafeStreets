import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PainelFiltros from "@/components/PainelFiltros/PainelFiltros";
import { PERIODOS } from "@/utils/filtros";
import { fetchNoticias, type Noticia } from "@/utils/noticias";

jest.mock("@/utils/noticias", () => ({
  fetchNoticias: jest.fn(),
}));

const mockFetchNoticias = fetchNoticias as jest.Mock;

const REGIOES_ADMINISTRATIVAS = ["Ceilândia", "Gama", "Plano Piloto"];

const mockNoticias: Noticia[] = [
  {
    id: "1",
    titulo: "Furtos a pedestres aumentam 14% na quadra comercial da 304 Sul",
    resumo: "Câmeras e patrulhamento a pé serão reforçados após série de ocorrências no fim de tarde.",
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
    id: "2",
    titulo: "Operação Taguatinga Segura reduz roubos de veículos em 22%",
    resumo: "Ação conjunta da PMDF e PCDF resultou em 8 prisões e apreensão de dois carros adulterados.",
    regiao: "Taguatinga",
    ra: "RA-III",
    data: "01/06/2026",
    fonte: "Nota oficial · PMDF",
    corpo: ["Primeiro parágrafo de teste."],
    fonteUrl: "https://www.pmdf.df.gov.br/",
    risco: "Baixo",
    lat: -15.833,
    lng: -48.057,
  },
  {
    id: "3",
    titulo: "Ceilândia registra queda de 18% nos crimes violentos no mês de maio",
    resumo: "Delegacia especializada atribui resultado ao aumento do efetivo e à videomonitoramento.",
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
  {
    id: "4",
    titulo: "Novo posto da PM é inaugurado no Gama para atender quadrantes rurais",
    resumo: "Estrutura atende comunidades rurais da região e reforça presença policial.",
    regiao: "Gama",
    ra: "RA-II",
    data: "30/05/2026",
    fonte: "Comunicado · GDF",
    corpo: ["Primeiro parágrafo de teste."],
    fonteUrl: "https://www.df.gov.br/",
    risco: "Baixo",
    lat: -16.0181,
    lng: -48.066,
  },
];

describe("PainelFiltros", () => {
  beforeEach(() => {
    mockFetchNoticias.mockReset();
    mockFetchNoticias.mockResolvedValue(mockNoticias);
  });

  describe("rendering", () => {
    it("renders the 'FILTROS' title", async () => {
      render(<PainelFiltros />);
      expect(screen.getByText("FILTROS")).toBeInTheDocument();
      // Aguardar chamada da API para evitar logs de state update sem act
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
    });

    it("renders the 'Região Administrativa' select with placeholder and known regions", async () => {
      render(<PainelFiltros />);
      const select = screen.getByLabelText("Região Administrativa");
      expect(select).toBeInTheDocument();
      expect((select as HTMLSelectElement).value).toBe("");
      expect(screen.getByText("Escolha uma opção", { selector: "select[aria-label='Região Administrativa'] option" })).toBeInTheDocument();
      
      // Wait for regions to load from mock API
      for (const regiao of REGIOES_ADMINISTRATIVAS) {
        expect(await screen.findByRole("option", { name: regiao })).toBeInTheDocument();
      }
    });

    it("renders the 'Período' select with placeholder and known periods", async () => {
      render(<PainelFiltros />);
      const select = screen.getByLabelText("Período");
      expect(select).toBeInTheDocument();
      expect((select as HTMLSelectElement).value).toBe("");
      PERIODOS.forEach((periodo) => {
        expect(screen.getByRole("option", { name: periodo.label })).toBeInTheDocument();
      });
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
    });

    it("renders the 'Limpar filtros' button and 'Buscar' field", async () => {
      render(<PainelFiltros />);
      expect(screen.getByRole("button", { name: "Limpar filtros" })).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Buscar")).toBeInTheDocument();
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
    });
  });

  describe("filter interactions", () => {
    it("updates the selected região administrativa", async () => {
      render(<PainelFiltros />);
      const select = await screen.findByLabelText("Região Administrativa") as HTMLSelectElement;
      await screen.findByRole("option", { name: REGIOES_ADMINISTRATIVAS[0] });
      fireEvent.change(select, { target: { value: REGIOES_ADMINISTRATIVAS[0] } });
      expect(select.value).toBe(REGIOES_ADMINISTRATIVAS[0]);
    });

    it("updates the selected período", async () => {
      render(<PainelFiltros />);
      const select = screen.getByLabelText("Período") as HTMLSelectElement;
      fireEvent.change(select, { target: { value: PERIODOS[0].value } });
      expect(select.value).toBe(PERIODOS[0].value);
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
    });

    it("updates the busca input value as the user types", async () => {
      render(<PainelFiltros />);
      const input = screen.getByPlaceholderText("Buscar") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "Ceilândia" } });
      expect(input.value).toBe("Ceilândia");
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
    });
  });

  describe("Limpar filtros (RF08)", () => {
    it("resets região, período and busca to their initial state (edge: clear after filling)", async () => {
      render(<PainelFiltros />);
      const regiaoSelect = await screen.findByLabelText("Região Administrativa") as HTMLSelectElement;
      await screen.findByRole("option", { name: REGIOES_ADMINISTRATIVAS[0] });
      const periodoSelect = screen.getByLabelText("Período") as HTMLSelectElement;
      const buscaInput = screen.getByPlaceholderText("Buscar") as HTMLInputElement;

      fireEvent.change(regiaoSelect, { target: { value: REGIOES_ADMINISTRATIVAS[0] } });
      fireEvent.change(periodoSelect, { target: { value: PERIODOS[0].value } });
      fireEvent.change(buscaInput, { target: { value: "texto qualquer" } });

      fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));

      expect(regiaoSelect.value).toBe("");
      expect(periodoSelect.value).toBe("");
      expect(buscaInput.value).toBe("");
    });
  });

  describe("Lista de resultados (RF06/RF07)", () => {
    it("shows no list and no empty message when no filter/busca is applied (initial state)", async () => {
      render(<PainelFiltros onSelecionarNoticia={() => {}} />);
      expect(screen.queryByText("Nenhum resultado encontrado")).not.toBeInTheDocument();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
    });

    it('shows "Nenhum resultado encontrado" when busca matches nothing', async () => {
      render(<PainelFiltros onSelecionarNoticia={() => {}} />);
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
      const input = screen.getByPlaceholderText("Buscar");
      fireEvent.change(input, { target: { value: "xxxxxxxxxxxx" } });
      expect(screen.getByText("Nenhum resultado encontrado")).toBeInTheDocument();
    });

    it("shows a list of matching results when a região filter is applied", async () => {
      const onSelecionarNoticia = jest.fn();
      render(<PainelFiltros onSelecionarNoticia={onSelecionarNoticia} />);
      const select = await screen.findByLabelText("Região Administrativa") as HTMLSelectElement;
      const regiao = "Ceilândia";
      await screen.findByRole("option", { name: regiao });

      fireEvent.change(select, { target: { value: regiao } });

      const esperados = mockNoticias.filter((n: Noticia) => n.regiao === regiao);
      esperados.forEach((noticia: Noticia) => {
        expect(screen.getByText(noticia.titulo)).toBeInTheDocument();
      });
      expect(screen.queryByText("Nenhum resultado encontrado")).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(esperados[0].titulo));
      expect(onSelecionarNoticia).toHaveBeenCalledWith(esperados[0]);
    });
  });

  describe("expand/collapse (RNF05 - adherence to prototype)", () => {
    it("starts expanded, showing the filter body", async () => {
      render(<PainelFiltros />);
      expect(screen.getByLabelText("Região Administrativa")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Recolher filtros" })).toBeInTheDocument();
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
    });

    it("hides the filter body when the collapse button is clicked", async () => {
      render(<PainelFiltros />);
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
      fireEvent.click(screen.getByRole("button", { name: "Recolher filtros" }));
      expect(screen.queryByLabelText("Região Administrativa")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Período")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Expandir filtros" })).toBeInTheDocument();
    });

    it("keeps the 'Buscar' field visible when the filter body is collapsed (edge: independent sections)", async () => {
      render(<PainelFiltros />);
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
      fireEvent.click(screen.getByRole("button", { name: "Recolher filtros" }));
      expect(screen.getByPlaceholderText("Buscar")).toBeInTheDocument();
    });

    it("shows the filter body again when toggled twice (edge: re-expand)", async () => {
      render(<PainelFiltros />);
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
      const toggle = () =>
        fireEvent.click(screen.getByRole("button", { name: /^(Recolher|Expandir) filtros$/ }));
      toggle();
      toggle();
      expect(screen.getByLabelText("Região Administrativa")).toBeInTheDocument();
    });
  });
});
