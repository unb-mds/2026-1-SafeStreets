import { fetchNoticiaPorId, type Noticia } from "./noticias";

/**
 * Obtém o resumo de IA da ocorrência (resumo SOB DEMANDA).
 *
 * - Se a ocorrência já veio com resumo (cache do banco, `resumo_status=COMPLETO`),
 *   usa direto — sem nova requisição.
 * - Caso contrário (resumo PENDENTE), busca o detalhe em `GET /ocorrencias/{id}`:
 *   o backend gera o resumo na hora (1 chamada ao Gemini só para a ocorrência que
 *   o usuário abriu) e cacheia. Retorna o resumo recém-gerado.
 *
 * Lança erro se o resumo continuar indisponível — o DetalhesOcorrencia trata esse
 * caso exibindo a mensagem de indisponibilidade (ADR-001, Opção A).
 */
export async function gerarResumoIA(noticia: Noticia): Promise<string> {
  if (noticia.resumo) {
    return noticia.resumo;
  }
  const detalhe = await fetchNoticiaPorId(noticia.id);
  if (!detalhe?.resumo) {
    throw new Error("Resumo de IA indisponível para esta ocorrência.");
  }
  return detalhe.resumo;
}
