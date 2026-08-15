import Link from "next/link";
import styles from "./Error.module.css";

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Account unavailable</p>
        <h1>This customer account is not in the current Steward portfolio.</h1>
        <p>
          It may have been removed, merged, or outside your organization scope.
        </p>
        <Link href="/">Return to control center</Link>
      </section>
    </main>
  );
}
