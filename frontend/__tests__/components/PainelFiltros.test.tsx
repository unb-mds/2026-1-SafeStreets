import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PainelFiltros from "@/components/PainelFiltros/PainelFiltros";
import { REGIOES_ADMINISTRATIVAS, PERIODOS } from "@/utils/filtros";
import { noticias } from "@/utils/noticias";

describe("PainelFiltros", () => {
  describe("rendering", () => {
    it("renders the 'FILTROS' title", () => {
      render(<PainelFiltros />);
      expect(screen.getByText("FILTROS")).toBeInTheDocument();
    });

    it("renders the 'Região Administrativa' select with placeholder and known regions", () => {
      render(<PainelFiltros />);
      const select = screen.getByLabelText("Região Administrativa");
      expect(select).toBeInTheDocument();
      expect((select as HTMLSelectElement).value).toBe("");
      expect(screen.getByText("Escolha uma opção", { selector: "select[aria-label='Região Administrativa'] option" })).toBeInTheDocument();
      REGIOES_ADMINISTRATIVAS.forEach((regiao) => {
        expect(screen.getByRole("option", { name: regiao })).toBeInTheDocument();
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
    it("updates the selected região administrativa", () => {
      render(<PainelFiltros />);
      const select = screen.getByLabelText("Região Administrativa") as HTMLSelectElement;
      fireEvent.change(select, { target: { value: REGIOES_ADMINISTRATIVAS[0] } });
      expect(select.value).toBe(REGIOES_ADMINISTRATIVAS[0]);
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
    it("resets região, período and busca to their initial state (edge: clear after filling)", () => {
      render(<PainelFiltros />);
      const regiaoSelect = screen.getByLabelText("Região Administrativa") as HTMLSelectElement;
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
    it("shows no list and no empty message when no filter/busca is applied (initial state)", () => {
      render(<PainelFiltros onSelecionarNoticia={() => {}} />);
      expect(screen.queryByText("Nenhum resultado encontrado")).not.toBeInTheDocument();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });

    it('shows "Nenhum resultado encontrado" when busca matches nothing', () => {
      render(<PainelFiltros onSelecionarNoticia={() => {}} />);
      const input = screen.getByPlaceholderText("Buscar");
      fireEvent.change(input, { target: { value: "xxxxxxxxxxxx" } });
      expect(screen.getByText("Nenhum resultado encontrado")).toBeInTheDocument();
    });

    it("shows a list of matching results when a região filter is applied", () => {
      const onSelecionarNoticia = jest.fn();
      render(<PainelFiltros onSelecionarNoticia={onSelecionarNoticia} />);
      const select = screen.getByLabelText("Região Administrativa") as HTMLSelectElement;
      const regiao = "Ceilândia";
      fireEvent.change(select, { target: { value: regiao } });

      const esperados = noticias.filter((n) => n.regiao === regiao);
      esperados.forEach((noticia) => {
        expect(screen.getByText(noticia.titulo)).toBeInTheDocument();
      });
      expect(screen.queryByText("Nenhum resultado encontrado")).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(esperados[0].titulo));
      expect(onSelecionarNoticia).toHaveBeenCalledWith(esperados[0]);
    });
  });

  describe("expand/collapse (RNF05 - adherence to prototype)", () => {
    it("starts expanded, showing the filter body", () => {
      render(<PainelFiltros />);
      expect(screen.getByLabelText("Região Administrativa")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Recolher filtros" })).toBeInTheDocument();
    });

    it("hides the filter body when the collapse button is clicked", () => {
      render(<PainelFiltros />);
      fireEvent.click(screen.getByRole("button", { name: "Recolher filtros" }));
      expect(screen.queryByLabelText("Região Administrativa")).not.toBeInTheDocument();
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
      expect(screen.getByLabelText("Região Administrativa")).toBeInTheDocument();
    });
  });
});
