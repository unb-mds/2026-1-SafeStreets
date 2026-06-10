import Hero from "@/components/Hero/Hero";
import NewsFeed from "@/components/NewsFeed/NewsFeed";
import { noticias } from "@/data/noticias";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Hero />
      <NewsFeed noticias={noticias} />
    </div>
  );
}
