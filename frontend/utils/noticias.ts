export type Risco = "Alto" | "Médio" | "Baixo";

export type Noticia = {
  id: string;
  titulo: string;
  resumo: string;
  regiao: string;
  ra: string;
  data: string;
  fonte: string;
  risco: Risco;
  lat: number;
  lng: number;
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
    risco: "Médio",
    lat: -15.7942,
    lng: -47.8822,
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
    risco: "Baixo",
    lat: -15.833,
    lng: -48.057,
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
    risco: "Baixo",
    lat: -15.815,
    lng: -48.114,
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
    risco: "Baixo",
    lat: -16.0181,
    lng: -48.066,
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
    risco: "Alto",
    lat: -15.653,
    lng: -47.789,
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
    risco: "Médio",
    lat: -15.874,
    lng: -48.089,
  },
];
