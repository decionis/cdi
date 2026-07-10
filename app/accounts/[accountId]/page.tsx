import { notFound } from "next/navigation";
import { AccountConnections } from "@/Components/Account/AccountConnections";
import { AccountDecisionPanel } from "@/Components/Account/AccountDecisionPanel";
import { AccountEvidence } from "@/Components/Account/AccountEvidence";
import { AccountHeader } from "@/Components/Account/AccountHeader";
import { AccountPolicy } from "@/Components/Account/AccountPolicy";
import { AccountTimeline } from "@/Components/Account/AccountTimeline";
import { AppShell } from "@/Components/Layout/AppShell";
import { CdiCompositionRoot } from "@/Infrastructure/Composition/CdiCompositionRoot";
import { CdiNotFoundError } from "@/Infrastructure/Errors/CdiErrors";
import styles from "@/Components/Account/Account.module.css";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const context = await new CdiCompositionRoot().createServerContext();

  try {
    const [account, opportunities] = await Promise.all([
      context.accounts.requireAccount(accountId),
      context.opportunities.list(),
    ]);
    const opportunity =
      opportunities.find((candidate) => candidate.accountId === account.id) ??
      null;
    const canReview = context.session.roles.some(
      (role) => role === "APPROVER" || role === "ADMIN",
    );

    return (
      <AppShell session={context.session}>
        <AccountHeader account={account} />
        <AccountDecisionPanel opportunity={opportunity} canReview={canReview} />
        <div className={styles.contentGrid}>
          <AccountEvidence evidence={account.evidence} />
          <div className={styles.sideStack}>
            <AccountConnections connectors={account.connectors} />
            <AccountPolicy policy={account.policyEnvelope} />
            <AccountTimeline events={account.timeline} />
          </div>
        </div>
      </AppShell>
    );
  } catch (error) {
    if (error instanceof CdiNotFoundError) notFound();
    throw error;
  }
}
