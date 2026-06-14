import React from "react";
import { render, screen } from "@testing-library/react";
import CardResumo from "@/components/CardResumo/CardResumo";
import { noticias } from "@/utils/noticias";

const noticia = noticias[0];

describe("CardResumo", () => {
  it("renders risco, título, RA, região and data", () => {
    render(<CardResumo noticia={noticia} />);
    expect(screen.getByText(noticia.risco)).toBeInTheDocument();
    expect(screen.getByText(noticia.titulo)).toBeInTheDocument();
    expect(screen.getByText(noticia.ra)).toBeInTheDocument();
    expect(screen.getByText(noticia.regiao)).toBeInTheDocument();
    expect(screen.getByText(noticia.data)).toBeInTheDocument();
  });

  it('renders a "Ver detalhes" link pointing to /ocorrencia/{id}', () => {
    render(<CardResumo noticia={noticia} />);
    const link = screen.getByRole("link", { name: "Ver detalhes" });
    expect(link).toHaveAttribute("href", `/ocorrencia/${noticia.id}`);
  });

  it("does not render any AI-generated summary (edge: RF10 excludes IA summary)", () => {
    render(<CardResumo noticia={noticia} />);
    expect(screen.queryByText(/resumo gerado por ia/i)).not.toBeInTheDocument();
  });
});
