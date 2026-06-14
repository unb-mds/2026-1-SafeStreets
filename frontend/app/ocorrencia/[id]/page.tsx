import { notFound } from "next/navigation";
import OcorrenciaDetalhes from "@/view/OcorrenciaDetalhes/OcorrenciaDetalhes";
import { noticias } from "@/utils/noticias";

interface OcorrenciaPageProps {
  params: Promise<{ id: string }>;
}

export default async function OcorrenciaPage({ params }: OcorrenciaPageProps) {
  const { id } = await params;
  const noticia = noticias.find((n) => n.id === id);

  if (!noticia) {
    notFound();
  }

  return <OcorrenciaDetalhes noticia={noticia} />;
}
