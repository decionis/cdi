import { Database, Link2 } from "lucide-react";
import type { EvidenceSignal } from "@/Domain/Evidence/EvidenceSignal";
import { StatusBadge } from "@/Components/Common/StatusBadge";
import { CdiFormat } from "@/Presentation/Format/CdiFormat";
import styles from "./Account.module.css";

function impactTone(impact: EvidenceSignal["impact"]) {
  if (impact === "POSITIVE") return "positive" as const;
  if (impact === "NEGATIVE") return "critical" as const;
  return "neutral" as const;
}

export function AccountEvidence({ evidence }: { evidence: EvidenceSignal[] }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <span>Correlated evidence</span>
          <h2>What CDI considered</h2>
        </div>
        <Database size={18} aria-hidden="true" />
      </div>
      <div className={styles.evidenceList}>
        {evidence.map((signal) => (
          <article key={signal.id} className={styles.evidenceItem}>
            <div className={styles.evidenceTopline}>
              <StatusBadge tone={impactTone(signal.impact)}>
                {signal.category}
              </StatusBadge>
              <span>{CdiFormat.relativeTime(signal.observedAt)}</span>
            </div>
            <h3>{signal.title}</h3>
            <p>{signal.detail}</p>
            <div className={styles.provenance}>
              <Link2 size={13} aria-hidden="true" />
              {signal.source} · {signal.sourceRecordId} ·{" "}
              {CdiFormat.confidence(signal.confidence)} confidence
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
