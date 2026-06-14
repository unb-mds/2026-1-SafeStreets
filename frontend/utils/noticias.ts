export type Noticia = {
  id: string;
  titulo: string;
  resumo: string;
  regiao: string;
  ra: string;
  data: string;
  fonte: string;
  corpo: string[]; // parágrafos da descrição detalhada (RF02)
  fonteUrl: string; // link original da fonte de dados (RF02)
};

export const noticias: Noticia[] = [
  {
    id: "1",
    titulo: "Furtos a pedestres aumentam 14% na quadra comercial da 304 Sul",
    resumo:
      "Câmeras e patrulhamento a pé serão reforçados após série de ocorrências no fim de tarde.",
    regiao: "Plano Piloto",
    ra: "RA-I",
    data: "02/06/2026",
    fonte: "Boletim de Segurança · SSP-DF",
    corpo: [
      "A Administração Regional do Plano Piloto confirmou um aumento de 14% nos registros de furto a pedestres na quadra comercial da 304 Sul durante o último mês, concentrados no período entre 17h e 20h.",
      "Segundo o boletim consolidado, a maior parte das ocorrências envolve celulares e bolsas subtraídos em pontos de ônibus e na saída de estabelecimentos comerciais. Não há registro de violência física na maioria dos casos.",
      "Como resposta, a Secretaria de Segurança Pública anunciou o reforço do patrulhamento a pé no horário de pico e a instalação de quatro novas câmeras com leitura noturna. Moradores podem acompanhar a evolução dos índices pelo mapa interativo do SafeStreets.",
    ],
    fonteUrl: "https://www.ssp.df.gov.br/",
  },
  {
    id: "2",
    titulo: "Operação Taguatinga Segura reduz roubos de veículos em 22%",
    resumo:
      "Ação conjunta da PMDF e PCDF resultou em 8 prisões e apreensão de dois carros adulterados.",
    regiao: "Taguatinga",
    ra: "RA-III",
    data: "01/06/2026",
    fonte: "Nota oficial · PMDF",
    corpo: [
      "A Operação Taguatinga Segura, deflagrada no início de maio, reduziu em 22% os roubos de veículos na região em comparação com o mesmo período do ano anterior.",
      "A ação conjunta da Polícia Militar e da Polícia Civil resultou em oito prisões e na apreensão de dois veículos com sinais identificadores adulterados.",
      "As forças de segurança informaram que o policiamento ostensivo nas principais vias de acesso será mantido pelos próximos meses.",
    ],
    fonteUrl: "https://www.pmdf.df.gov.br/",
  },
  {
    id: "3",
    titulo: "Ceilândia registra queda de 18% nos crimes violentos no mês de maio",
    resumo:
      "Delegacia especializada atribui resultado ao aumento do efetivo e à videomonitoramento ampliado.",
    regiao: "Ceilândia",
    ra: "RA-IX",
    data: "31/05/2026",
    fonte: "Relatório Mensal · PCDF",
    corpo: [
      "Os crimes violentos contra a pessoa caíram 18% em Ceilândia no mês de maio, segundo o relatório mensal da Polícia Civil do Distrito Federal.",
      "A delegacia especializada atribui o resultado ao aumento do efetivo nas regiões administrativas e à ampliação do videomonitoramento integrado.",
      "O órgão ressalta que a tendência precisa ser confirmada nos próximos meses antes de ser considerada estrutural.",
    ],
    fonteUrl: "https://www.pcdf.df.gov.br/",
  },
  {
    id: "4",
    titulo: "Novo posto da PM é inaugurado no Gama para atender quadrantes rurais",
    resumo:
      "Estrutura atende comunidades rurais da região e reforça presença policial em áreas de baixa cobertura.",
    regiao: "Gama",
    ra: "RA-II",
    data: "30/05/2026",
    fonte: "Comunicado · GDF",
    corpo: [
      "Um novo posto policial foi inaugurado no Gama com foco no atendimento das comunidades rurais da região, historicamente com menor cobertura de policiamento.",
      "A estrutura conta com equipes dedicadas ao patrulhamento das áreas de chácaras e assentamentos, além de um canal direto para denúncias.",
      "O Governo do Distrito Federal afirma que outras unidades semelhantes estão previstas para regiões periféricas ao longo do ano.",
    ],
    fonteUrl: "https://www.df.gov.br/",
  },
  {
    id: "5",
    titulo: "Alerta: aumento de golpes do Pix em Sobradinho durante o fim de semana",
    resumo:
      "PCDF orienta população a não transferir valores para desconhecidos e a ativar dupla autenticação.",
    regiao: "Sobradinho",
    ra: "RA-V",
    data: "29/05/2026",
    fonte: "Alerta de Segurança · PCDF",
    corpo: [
      "A Polícia Civil emitiu um alerta sobre o aumento de golpes envolvendo transferências via Pix em Sobradinho durante os fins de semana.",
      "Os golpistas têm se passado por parentes e por funcionários de instituições financeiras para induzir vítimas a transferir valores rapidamente.",
      "A orientação é não realizar transferências para desconhecidos, desconfiar de pedidos urgentes e ativar a dupla autenticação nos aplicativos bancários.",
    ],
    fonteUrl: "https://www.pcdf.df.gov.br/",
  },
  {
    id: "6",
    titulo: "Samambaia tem reforço policial após série de arrombamentos em comércios",
    resumo:
      "Câmeras flagraram suspeitos; duas pessoas foram detidas para averiguação na madrugada de sábado.",
    regiao: "Samambaia",
    ra: "RA-XII",
    data: "28/05/2026",
    fonte: "Boletim de Segurança · SSP-DF",
    corpo: [
      "Uma série de arrombamentos a comércios em Samambaia motivou o reforço do policiamento na região nas últimas semanas.",
      "Câmeras de segurança flagraram os suspeitos, e duas pessoas foram detidas para averiguação na madrugada de sábado.",
      "A Secretaria de Segurança Pública informou que as investigações seguem em andamento para identificar os demais envolvidos.",
    ],
    fonteUrl: "https://www.ssp.df.gov.br/",
  },
];

/** Busca uma notícia pelo seu id. Retorna `undefined` se não existir. */
export function getNoticiaPorId(id: string): Noticia | undefined {
  return noticias.find((noticia) => noticia.id === id);
}
