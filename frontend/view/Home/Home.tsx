"use client";

import Hero from "@/components/Hero/Hero";
import NewsFeed from "@/components/NewsFeed/NewsFeed";
import { noticias } from "@/utils/noticias";
import { filtrarNoticias } from "@/utils/busca";
import { useSearch } from "@/components/SearchProvider/SearchProvider";
import styles from "./Home.module.css";

export default function Home() {
  const { query } = useSearch();
  const noticiasFiltradas = filtrarNoticias(noticias, query);

  return (
    <div className={styles.page}>
      <Hero />
      <NewsFeed noticias={noticiasFiltradas} />
    </div>
  );
}
