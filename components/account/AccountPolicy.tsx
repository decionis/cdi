import { LockKeyhole } from "lucide-react";
import type { CustomerAccount } from "@/domain/accounts/CustomerAccount";
import { CdiFormat } from "@/presentation/format/CdiFormat";
import { StatusBadge } from "@/components/common/StatusBadge";
import styles from "./Account.module.css";

export function AccountPolicy({
  policy,
}: {
  policy: CustomerAccount["policyEnvelope"];
}) {
  return (
    <section className={styles.sidePanel}>
      <div className={styles.panelHeading}>
        <div>
          <span>Authority boundary</span>
          <h2>Active policy envelope</h2>
        </div>
        <LockKeyhole size={18} aria-hidden="true" />
      </div>
      <dl className={styles.policyList}>
        <div>
          <dt>Policy version</dt>
          <dd>{policy.policyVersion}</dd>
        </div>
        <div>
          <dt>Review threshold</dt>
          <dd>
            {CdiFormat.money(
              policy.reviewThreshold.amount,
              policy.reviewThreshold.currency,
            )}
          </dd>
        </div>
        <div>
          <dt>Automatic increase</dt>
          <dd>{CdiFormat.percent(policy.maximumAutoIncreasePercent)}</dd>
        </div>
      </dl>
      <StatusBadge
        tone={policy.automaticChangesEnabled ? "warning" : "positive"}
        dot
      >
        {policy.automaticChangesEnabled
          ? "Constrained auto enabled"
          : "Human approval required"}
      </StatusBadge>
      <p className={styles.policyNote}>
        CDI may recommend a change. Only Decionis can authorize the exact action
        under this versioned envelope.
      </p>
    </section>
  );
}
