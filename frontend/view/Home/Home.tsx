import Hero from "@/components/Hero/Hero";
import NewsFeed from "@/components/NewsFeed/NewsFeed";
import { noticias } from "@/utils/noticias";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <Hero />
      <NewsFeed noticias={noticias} />
    </div>
  );
}
