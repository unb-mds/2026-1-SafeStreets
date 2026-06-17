import type { Noticia } from "./noticias";

const ID_SEM_RESUMO = "5";
const LATENCIA_MS = 600;

export async function gerarResumoIA(noticia: Noticia): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, LATENCIA_MS));

  if (noticia.id === ID_SEM_RESUMO) {
    throw new Error("Resumo de IA indisponível para esta ocorrência.");
  }

  return `Resumo gerado por IA: ${noticia.resumo}`;
}
