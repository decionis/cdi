import { FileKey2 } from "lucide-react";
import type { CustomerOpportunity } from "@/domain/opportunities/CustomerOpportunity";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CdiFormat } from "@/presentation/format/CdiFormat";
import { ReviewAction } from "@/components/dashboard/ReviewAction";
import styles from "./Account.module.css";

export function AccountDecisionPanel({
  opportunity,
  canReview,
}: {
  opportunity: CustomerOpportunity | null;
  canReview: boolean;
}) {
  if (!opportunity) {
    return (
      <section className={styles.decisionPanel}>
        <StatusBadge tone="positive" dot>
          No action
        </StatusBadge>
        <h2>Account remains inside the approved operating envelope.</h2>
        <p>
          CDI will continue monitoring for material changes in evidence or
          policy state.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.decisionPanel}>
      <div className={styles.decisionTopline}>
        <StatusBadge tone="violet" dot>
          {opportunity.disposition}
        </StatusBadge>
        <span>{CdiFormat.confidence(opportunity.confidence)} confidence</span>
      </div>
      <h2>{opportunity.title}</h2>
      <p>{opportunity.rationale}</p>
      <div className={styles.nextAction}>
        <strong>Recommended next action</strong>
        <span>{opportunity.recommendedAction}</span>
      </div>
      <div className={styles.dossierLine}>
        <FileKey2 size={15} aria-hidden="true" />
        {opportunity.dossierId ?? "Decision Dossier pending"}
      </div>
      <ReviewAction opportunityId={opportunity.id} canReview={canReview} />
    </section>
  );
}
