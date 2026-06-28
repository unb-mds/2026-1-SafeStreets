"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero/Hero";
import NewsFeed from "@/components/NewsFeed/NewsFeed";
import { fetchNoticias, type Noticia } from "@/utils/noticias";
import { filtrarNoticias } from "@/utils/busca";
import { useSearch } from "@/components/SearchProvider/SearchProvider";
import styles from "./Home.module.css";

export default function Home() {
  const { query } = useSearch();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetchNoticias()
      .then(setNoticias)
      .catch(() => setNoticias([]))
      .finally(() => setCarregando(false));
  }, []);

  const noticiasFiltradas = filtrarNoticias(noticias, query);

  return (
    <div className={styles.page}>
      <Hero />
      {carregando ? (
        <p style={{ textAlign: "center", padding: "2rem", color: "var(--cor-cinza)" }}>
          Carregando notícias...
        </p>
      ) : (
        <NewsFeed noticias={noticiasFiltradas} />
      )}
    </div>
  );
}
