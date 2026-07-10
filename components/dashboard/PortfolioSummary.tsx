import {
  ArrowUpRight,
  CircleAlert,
  FileCheck2,
  Gauge,
  Users,
} from "lucide-react";
import type { PortfolioSummary as PortfolioSummaryModel } from "@/domain/portfolio/PortfolioSnapshot";
import { CdiFormat } from "@/presentation/format/CdiFormat";
import styles from "./Dashboard.module.css";

const summaryDefinitions = [
  {
    key: "totalAccounts",
    label: "Monitored accounts",
    icon: Users,
    tone: "neutral",
  },
  {
    key: "accountsWithFriction",
    label: "Active friction",
    icon: CircleAlert,
    tone: "critical",
  },
  {
    key: "expansionReady",
    label: "Expansion ready",
    icon: ArrowUpRight,
    tone: "positive",
  },
  {
    key: "reviewsRequired",
    label: "Reviews required",
    icon: FileCheck2,
    tone: "warning",
  },
] as const;

export function PortfolioSummary({
  summary,
}: {
  summary: PortfolioSummaryModel;
}) {
  return (
    <section className={styles.summaryGrid} aria-label="Portfolio summary">
      {summaryDefinitions.map((definition) => {
        const Icon = definition.icon;
        return (
          <article
            key={definition.key}
            className={styles.summaryCard}
            data-tone={definition.tone}
          >
            <div className={styles.summaryTopline}>
              <span>{definition.label}</span>
              <Icon size={18} aria-hidden="true" />
            </div>
            <strong>{summary[definition.key]}</strong>
            <small>
              {definition.key === "totalAccounts"
                ? `${CdiFormat.percent(summary.averageEvidenceCoverage)} average evidence coverage`
                : "Current governed portfolio"}
            </small>
          </article>
        );
      })}
      <article className={`${styles.summaryCard} ${styles.coverageCard}`}>
        <div className={styles.summaryTopline}>
          <span>Evidence coverage</span>
          <Gauge size={18} aria-hidden="true" />
        </div>
        <strong>{CdiFormat.percent(summary.averageEvidenceCoverage)}</strong>
        <div className={styles.progressTrack}>
          <span style={{ width: `${summary.averageEvidenceCoverage}%` }} />
        </div>
      </article>
    </section>
  );
}
