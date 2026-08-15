"use client";

import { AlertTriangle } from "lucide-react";
import styles from "./Error.module.css";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.icon}>
          <AlertTriangle size={22} aria-hidden="true" />
        </span>
        <p className={styles.eyebrow}>Evidence unavailable</p>
        <h1>Steward could not assemble this control-center view.</h1>
        <p>
          No policy decision was changed. Check the Decionis connection or retry
          the evidence request.
        </p>
        <button onClick={reset} type="button">
          Retry
        </button>
      </section>
    </main>
  );
}
