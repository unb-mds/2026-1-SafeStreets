import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ResultadoBusca from "@/components/ResultadoBusca/ResultadoBusca";
import { noticiasFixture } from "../fixtures/noticias";

const noticia = noticiasFixture[0];

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
