import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardResumo from "@/components/CardResumo/CardResumo";
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

describe("CardResumo", () => {
  it("renders risco, título, RA, região and data", () => {
    render(<CardResumo noticia={noticia} onVerDetalhes={() => {}} />);
    expect(screen.getByText(noticia.risco)).toBeInTheDocument();
    expect(screen.getByText(noticia.titulo)).toBeInTheDocument();
    expect(screen.getByText(`RA — ${noticia.ra}`)).toBeInTheDocument();
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
