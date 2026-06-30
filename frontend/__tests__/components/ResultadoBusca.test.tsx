import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ResultadoBusca from "@/components/ResultadoBusca/ResultadoBusca";
import type { Noticia } from "@/utils/noticias";

const noticia: Noticia = {
  id: "1",
  titulo: "Furtos a pedestres aumentam 14% na quadra comercial da 304 Sul",
  resumo: "Câmeras e patrulhamento a pé serão reforçados após série de ocorrências no fim de tarde.",
  regiao: "Plano Piloto",
  ra: "RA-I",
  data: "02/06/2026",
  fonte: "Boletim de Segurança · SSP-DF",
  corpo: [
    "Primeiro parágrafo de teste.",
  ],
  fonteUrl: "https://www.ssp.df.gov.br/",
  risco: "Médio",
  lat: -15.7942,
  lng: -47.8822,
};

describe("ResultadoBusca", () => {
  it("renders the title, RA code and região of the noticia", () => {
    render(<ResultadoBusca noticia={noticia} selecionado={false} onSelecionar={() => {}} />);
    expect(screen.getByText(noticia.titulo)).toBeInTheDocument();
    expect(screen.getByText(noticia.ra)).toBeInTheDocument();
    expect(screen.getByText(noticia.regiao)).toBeInTheDocument();
  });

  it("calls onSelecionar when clicked", () => {
    const onSelecionar = jest.fn();
    render(<ResultadoBusca noticia={noticia} selecionado={false} onSelecionar={onSelecionar} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSelecionar).toHaveBeenCalledTimes(1);
  });

  it("reflects the selecionado prop via aria-pressed", () => {
    const { rerender } = render(
      <ResultadoBusca noticia={noticia} selecionado={false} onSelecionar={() => {}} />
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");

    rerender(<ResultadoBusca noticia={noticia} selecionado onSelecionar={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });
});
