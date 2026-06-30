import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PainelFiltros from "@/components/PainelFiltros/PainelFiltros";
import { PERIODOS } from "@/utils/filtros";
import { fetchNoticias } from "@/utils/noticias";
import { noticiasFixture } from "../fixtures/noticias";

jest.mock("@/utils/noticias", () => ({
  ...jest.requireActual("@/utils/noticias"),
  fetchNoticias: jest.fn(),
}));

const mockFetchNoticias = fetchNoticias as jest.MockedFunction<typeof fetchNoticias>;

const REGIOES = Array.from(new Set(noticiasFixture.map((n) => n.regiao))).sort((a, b) =>
  a.localeCompare(b, "pt-BR")
);

async function renderEAguardarCarga() {
  const utils = render(<PainelFiltros />);
  await waitFor(() => {
    REGIOES.forEach((regiao) => {
      expect(screen.getByRole("option", { name: regiao })).toBeInTheDocument();
    });
  });
  return utils;
}

describe("PainelFiltros", () => {
  beforeEach(() => {
    mockFetchNoticias.mockReset();
    mockFetchNoticias.mockResolvedValue(noticiasFixture);
  });

  describe("rendering", () => {
    it("renders the 'FILTROS' title", () => {
      render(<PainelFiltros />);
      expect(screen.getByText("FILTROS")).toBeInTheDocument();
    });

    it("renders the 'Região' select with placeholder, 'Todas' and known regions loaded from the API", async () => {
      render(<PainelFiltros />);
      const select = screen.getByLabelText("Região");
      expect(select).toBeInTheDocument();
      expect((select as HTMLSelectElement).value).toBe("");
      expect(screen.getByText("Escolha uma opção", { selector: "select[aria-label='Região'] option" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Todas" })).toBeInTheDocument();

      await waitFor(() => {
        REGIOES.forEach((regiao) => {
          expect(screen.getByRole("option", { name: regiao })).toBeInTheDocument();
        });
      });
    });

    it("renders the 'Período' select with placeholder and known periods", () => {
      render(<PainelFiltros />);
      const select = screen.getByLabelText("Período");
      expect(select).toBeInTheDocument();
      expect((select as HTMLSelectElement).value).toBe("");
      PERIODOS.forEach((periodo) => {
        expect(screen.getByRole("option", { name: periodo.label })).toBeInTheDocument();
      });
    });

    it("renders the 'Limpar filtros' button and 'Buscar' field", () => {
      render(<PainelFiltros />);
      expect(screen.getByRole("button", { name: "Limpar filtros" })).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Buscar")).toBeInTheDocument();
    });
  });

  describe("filter interactions", () => {
    it("updates the selected região administrativa", async () => {
      await renderEAguardarCarga();
      const select = screen.getByLabelText("Região") as HTMLSelectElement;
      fireEvent.change(select, { target: { value: REGIOES[0] } });
      expect(select.value).toBe(REGIOES[0]);
    });

    it("updates the selected período", () => {
      render(<PainelFiltros />);
      const select = screen.getByLabelText("Período") as HTMLSelectElement;
      fireEvent.change(select, { target: { value: PERIODOS[0].value } });
      expect(select.value).toBe(PERIODOS[0].value);
    });

    it("updates the busca input value as the user types", () => {
      render(<PainelFiltros />);
      const input = screen.getByPlaceholderText("Buscar") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "Ceilândia" } });
      expect(input.value).toBe("Ceilândia");
    });
  });

  describe("Limpar filtros (RF08)", () => {
    it("resets região, período and busca to their initial state (edge: clear after filling)", async () => {
      await renderEAguardarCarga();
      const regiaoSelect = screen.getByLabelText("Região") as HTMLSelectElement;
      const periodoSelect = screen.getByLabelText("Período") as HTMLSelectElement;
      const buscaInput = screen.getByPlaceholderText("Buscar") as HTMLInputElement;

      fireEvent.change(regiaoSelect, { target: { value: REGIOES[0] } });
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
      await waitFor(() => expect(mockFetchNoticias).toHaveBeenCalled());
      expect(screen.queryByText("Nenhum resultado encontrado")).not.toBeInTheDocument();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });

    it('shows "Nenhum resultado encontrado" when busca matches nothing', async () => {
      render(<PainelFiltros onSelecionarNoticia={() => {}} />);
      const input = screen.getByPlaceholderText("Buscar");
      fireEvent.change(input, { target: { value: "xxxxxxxxxxxx" } });
      await waitFor(() => {
        expect(screen.getByText("Nenhum resultado encontrado")).toBeInTheDocument();
      });
    });

    it("shows a list of matching results when a região filter is applied", async () => {
      const onSelecionarNoticia = jest.fn();
      render(<PainelFiltros onSelecionarNoticia={onSelecionarNoticia} />);
      const select = screen.getByLabelText("Região") as HTMLSelectElement;
      const regiao = "Ceilândia";
      await waitFor(() => expect(screen.getByRole("option", { name: regiao })).toBeInTheDocument());
      fireEvent.change(select, { target: { value: regiao } });

      const esperados = noticiasFixture.filter((n) => n.regiao === regiao);
      await waitFor(() => {
        esperados.forEach((noticia) => {
          expect(screen.getByText(noticia.titulo)).toBeInTheDocument();
        });
      });
      expect(screen.queryByText("Nenhum resultado encontrado")).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(esperados[0].titulo));
      expect(onSelecionarNoticia).toHaveBeenCalledWith(esperados[0]);
    });

    it('shows all noticias when "Todas" is selected as região', async () => {
      render(<PainelFiltros onSelecionarNoticia={() => {}} />);
      const select = screen.getByLabelText("Região") as HTMLSelectElement;
      fireEvent.change(select, { target: { value: "todas" } });

      await waitFor(() => {
        noticiasFixture.forEach((noticia) => {
          expect(screen.getByText(noticia.titulo)).toBeInTheDocument();
        });
      });
    });
  });

  describe("expand/collapse (RNF05 - adherence to prototype)", () => {
    it("starts expanded, showing the filter body", () => {
      render(<PainelFiltros />);
      expect(screen.getByLabelText("Região")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Recolher filtros" })).toBeInTheDocument();
    });

    it("hides the filter body when the collapse button is clicked", () => {
      render(<PainelFiltros />);
      fireEvent.click(screen.getByRole("button", { name: "Recolher filtros" }));
      expect(screen.queryByLabelText("Região")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Período")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Expandir filtros" })).toBeInTheDocument();
    });

    it("keeps the 'Buscar' field visible when the filter body is collapsed (edge: independent sections)", () => {
      render(<PainelFiltros />);
      fireEvent.click(screen.getByRole("button", { name: "Recolher filtros" }));
      expect(screen.getByPlaceholderText("Buscar")).toBeInTheDocument();
    });

    it("shows the filter body again when toggled twice (edge: re-expand)", () => {
      render(<PainelFiltros />);
      const toggle = () =>
        fireEvent.click(screen.getByRole("button", { name: /^(Recolher|Expandir) filtros$/ }));
      toggle();
      toggle();
      expect(screen.getByLabelText("Região")).toBeInTheDocument();
    });
  });
});
