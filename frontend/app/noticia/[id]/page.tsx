import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchNoticiaPorId } from "@/utils/noticias";
import NoticiaDetalhe from "@/view/NoticiaDetalhe/NoticiaDetalhe";

type PageProps = {
  params: Promise<{ id: string }>;
};

// Rota dinâmica: IDs vêm do banco, não são conhecidos em build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const noticia = await fetchNoticiaPorId(id);
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
  const noticia = await fetchNoticiaPorId(id);

  if (!noticia) {
    notFound();
  }

  return <NoticiaDetalhe noticia={noticia} />;
}
