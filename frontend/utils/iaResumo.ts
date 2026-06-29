import type { Noticia } from "./noticias";

/**
 * Retorna o resumo de IA armazenado na ocorrência (campo resumo_gemini do banco).
 * Lança erro se o resumo não estiver disponível — o componente DetalhesOcorrencia
 * já trata esse caso exibindo mensagem de indisponibilidade (ADR-001, Opção A).
 */
export async function gerarResumoIA(noticia: Noticia): Promise<string> {
  if (!noticia.resumo) {
    throw new Error("Resumo de IA indisponível para esta ocorrência.");
  }
  return noticia.resumo;
}
