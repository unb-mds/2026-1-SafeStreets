import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import OcorrenciaDetalhes from "@/view/OcorrenciaDetalhes/OcorrenciaDetalhes";
import { noticias } from "@/utils/noticias";
import { gerarResumoIA } from "@/utils/iaResumo";

jest.mock("@/utils/iaResumo", () => ({
  gerarResumoIA: jest.fn(),
}));

const mockGerarResumoIA = gerarResumoIA as jest.MockedFunction<typeof gerarResumoIA>;

const noticia = noticias[0];

describe("OcorrenciaDetalhes", () => {
  beforeEach(() => {
    mockGerarResumoIA.mockReset();
  });

  it("renders título, risco, RA, região and data", () => {
    mockGerarResumoIA.mockReturnValue(new Promise(() => {}));
    render(<OcorrenciaDetalhes noticia={noticia} />);
    expect(screen.getByText(noticia.titulo)).toBeInTheDocument();
    expect(screen.getByText(noticia.risco)).toBeInTheDocument();
    expect(screen.getByText(noticia.ra)).toBeInTheDocument();
    expect(screen.getByText(noticia.regiao)).toBeInTheDocument();
    expect(screen.getByText(noticia.data)).toBeInTheDocument();
  });

  it("shows a loading indicator while the AI summary is being generated", () => {
    mockGerarResumoIA.mockReturnValue(new Promise(() => {}));
    render(<OcorrenciaDetalhes noticia={noticia} />);
    expect(screen.getByText(/carregando resumo/i)).toBeInTheDocument();
  });

  it("shows the AI summary once it is ready", async () => {
    mockGerarResumoIA.mockResolvedValue("Resumo gerado por IA: texto de exemplo.");
    render(<OcorrenciaDetalhes noticia={noticia} />);

    await waitFor(() => {
      expect(screen.getByText("Resumo gerado por IA: texto de exemplo.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/carregando resumo/i)).not.toBeInTheDocument();
  });

  it("shows an unavailability message when the AI summary cannot be generated (edge)", async () => {
    mockGerarResumoIA.mockRejectedValue(new Error("Resumo de IA indisponível para esta ocorrência."));
    render(<OcorrenciaDetalhes noticia={noticia} />);

    await waitFor(() => {
      expect(screen.getByText(/não foi possível gerar o resumo/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/carregando resumo/i)).not.toBeInTheDocument();
  });
});
