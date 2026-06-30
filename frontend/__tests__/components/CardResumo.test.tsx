import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardResumo from "@/components/CardResumo/CardResumo";
import { noticiasFixture } from "../fixtures/noticias";

const noticia = noticiasFixture[0];

describe("CardResumo", () => {
  it("renders risco, título, RA, região and data", () => {
    render(<CardResumo noticia={noticia} onVerDetalhes={() => {}} />);
    expect(screen.getByText(noticia.risco)).toBeInTheDocument();
    expect(screen.getByText(noticia.titulo)).toBeInTheDocument();
    const raEsperada = noticia.ra.toUpperCase().startsWith("RA")
      ? noticia.ra.replace(/^RA[-—\s]*/i, "RA — ")
      : `RA — ${noticia.ra}`;
    expect(screen.getByText(raEsperada)).toBeInTheDocument();
    expect(screen.getByText(noticia.regiao)).toBeInTheDocument();
    expect(screen.getByText(noticia.data)).toBeInTheDocument();
  });

  it('calls onVerDetalhes when the "Ver detalhes" button is clicked', async () => {
    const onVerDetalhes = jest.fn();
    render(<CardResumo noticia={noticia} onVerDetalhes={onVerDetalhes} />);

    await userEvent.click(screen.getByRole("button", { name: "Ver detalhes" }));
    expect(onVerDetalhes).toHaveBeenCalledTimes(1);
  });

  it("does not render any AI-generated summary (edge: RF10 excludes IA summary)", () => {
    render(<CardResumo noticia={noticia} onVerDetalhes={() => {}} />);
    expect(screen.queryByText(/resumo gerado por ia/i)).not.toBeInTheDocument();
  });
});
