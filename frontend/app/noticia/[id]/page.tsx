import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { noticias, getNoticiaPorId } from "@/utils/noticias";
import NoticiaDetalhe from "@/view/NoticiaDetalhe/NoticiaDetalhe";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return noticias.map((noticia) => ({ id: noticia.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const noticia = getNoticiaPorId(id);
  if (!noticia) {
    return { title: "Notícia não encontrada — SafeStreets" };
  }
  return {
    title: `${noticia.titulo} — SafeStreets`,
    description: noticia.resumo,
  };
}

export default async function NoticiaPage({ params }: PageProps) {
  const { id } = await params;
  const noticia = getNoticiaPorId(id);

  if (!noticia) {
    notFound();
  }

  return <NoticiaDetalhe noticia={noticia} />;
}
