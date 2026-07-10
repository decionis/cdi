import type { ReactNode } from "react";
import styles from "./StatusBadge.module.css";

type Tone = "neutral" | "positive" | "warning" | "critical" | "info" | "violet";

export interface StatusBadgeProps {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
}

export function StatusBadge({
  children,
  tone = "neutral",
  dot = false,
}: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
