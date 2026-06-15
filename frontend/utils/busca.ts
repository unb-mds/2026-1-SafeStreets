import type { Noticia } from "./noticias";

/**
 * Normaliza um texto para comparação de busca: minúsculas, sem acentos e sem
 * espaços nas extremidades. Permite que "ceilandia" encontre "Ceilândia".
 */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/**
 * Filtra a lista de notícias por um termo de busca, comparando contra título,
 * resumo, região e fonte. Termo vazio retorna a lista original.
 */
export function filtrarNoticias(lista: Noticia[], termo: string): Noticia[] {
  const termoNormalizado = normalizar(termo);
  if (termoNormalizado.length === 0) {
    return lista;
  }

  return lista.filter((noticia) => {
    const alvo = normalizar(
      `${noticia.titulo} ${noticia.resumo} ${noticia.regiao} ${noticia.fonte}`
    );
    return alvo.includes(termoNormalizado);
  });
}
