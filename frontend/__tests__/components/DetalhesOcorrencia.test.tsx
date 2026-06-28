import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DetalhesOcorrencia from "@/components/DetalhesOcorrencia/DetalhesOcorrencia";
import { noticias } from "@/utils/noticias";
import { gerarResumoIA } from "@/utils/iaResumo";

jest.mock("@/utils/iaResumo", () => ({
  gerarResumoIA: jest.fn(),
}));

const mockGerarResumoIA = gerarResumoIA as jest.MockedFunction<typeof gerarResumoIA>;

const noticia = noticias[0];

describe("DetalhesOcorrencia", () => {
  beforeEach(() => {
    mockGerarResumoIA.mockReset();
  });

  it("renders título, risco, RA, região e data", () => {
    mockGerarResumoIA.mockReturnValue(new Promise(() => {}));
    render(<DetalhesOcorrencia noticia={noticia} onFechar={() => {}} />);

    expect(screen.getByText(noticia.titulo)).toBeInTheDocument();
    expect(screen.getByText(noticia.risco)).toBeInTheDocument();
    expect(screen.getByText(`RA — ${noticia.ra}`)).toBeInTheDocument();
    expect(screen.getByText(noticia.regiao)).toBeInTheDocument();
    expect(screen.getByText(noticia.data)).toBeInTheDocument();
  });

  it("não exibe o resumo breve da notícia", () => {
    mockGerarResumoIA.mockReturnValue(new Promise(() => {}));
    render(<DetalhesOcorrencia noticia={noticia} onFechar={() => {}} />);

    expect(screen.queryByText(noticia.resumo)).not.toBeInTheDocument();
  });

  it("shows a loading indicator while the AI summary is being generated", () => {
    mockGerarResumoIA.mockReturnValue(new Promise(() => {}));
    render(<DetalhesOcorrencia noticia={noticia} onFechar={() => {}} />);
    expect(screen.getByText(/carregando resumo/i)).toBeInTheDocument();
  });

  it("shows the AI summary once it is ready", async () => {
    mockGerarResumoIA.mockResolvedValue("Resumo gerado por IA: texto de exemplo.");
    render(<DetalhesOcorrencia noticia={noticia} onFechar={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Resumo gerado por IA: texto de exemplo.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/carregando resumo/i)).not.toBeInTheDocument();
  });

  it("shows an unavailability message when the AI summary cannot be generated (edge)", async () => {
    mockGerarResumoIA.mockRejectedValue(new Error("Resumo de IA indisponível para esta ocorrência."));
    render(<DetalhesOcorrencia noticia={noticia} onFechar={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/não foi possível gerar o resumo/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/carregando resumo/i)).not.toBeInTheDocument();
  });

  it("calls onFechar when the close button is clicked", async () => {
    mockGerarResumoIA.mockReturnValue(new Promise(() => {}));
    const onFechar = jest.fn();
    render(<DetalhesOcorrencia noticia={noticia} onFechar={onFechar} />);

    await userEvent.click(screen.getByRole("button", { name: /fechar/i }));
    expect(onFechar).toHaveBeenCalledTimes(1);
  });
});
