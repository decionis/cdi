import styles from "./Loading.module.css";

export default function LoadingPage() {
  return (
    <main className={styles.page} aria-label="Loading Steward control center">
      <div className={styles.sidebar} />
      <div className={styles.content}>
        <div className={styles.line} />
        <div className={styles.title} />
        <div className={styles.grid}>
          {Array.from({ length: 5 }, (_, index) => (
            <div className={styles.card} key={index} />
          ))}
        </div>
        <div className={styles.panel} />
        <div className={styles.panel} />
      </div>
    </main>
  );
}
