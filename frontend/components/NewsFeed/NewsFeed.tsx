import type { Noticia } from "@/utils/noticias";
import NewsCard from "@/components/NewsCard/NewsCard";
import styles from "./NewsFeed.module.css";

interface NewsFeedProps {
  noticias: Noticia[];
}

export default function NewsFeed({ noticias }: NewsFeedProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Notícias</h2>
        <span className={styles.counter}>{noticias.length} recentes</span>
      </div>
      <div className={styles.feed}>
        {noticias.map((noticia) => (
          <NewsCard key={noticia.id} noticia={noticia} />
        ))}
      </div>
    </section>
  );
}
