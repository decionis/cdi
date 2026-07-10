import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type {
  AccountState,
  AccountSummary,
} from "@/Domain/Accounts/CustomerAccount";
import { CdiFormat } from "@/Presentation/Format/CdiFormat";
import { StatusBadge } from "@/Components/Common/StatusBadge";
import styles from "./Dashboard.module.css";

function stateTone(state: AccountState) {
  if (state === "HEALTHY") return "positive" as const;
  if (state === "FRICTION") return "critical" as const;
  if (state === "EXPANSION_READY") return "violet" as const;
  return "warning" as const;
}

export function AccountPortfolioTable({
  accounts,
}: {
  accounts: AccountSummary[];
}) {
  return (
    <section id="accounts" className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <span>Account portfolio</span>
          <h2>Customer operating state</h2>
        </div>
        <p>Correlated across usage, support, CRM and regulated operations</p>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Account</th>
              <th>State</th>
              <th>Limit utilization</th>
              <th>Evidence</th>
              <th>Owner</th>
              <th aria-label="Open account" />
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>
                  <strong>{account.name}</strong>
                  <small>
                    {account.segment} · {account.primaryRegion}
                  </small>
                </td>
                <td>
                  <StatusBadge tone={stateTone(account.state)}>
                    {account.state.replaceAll("_", " ")}
                  </StatusBadge>
                </td>
                <td>
                  <strong>{CdiFormat.percent(account.limitUtilization)}</strong>
                  <small>
                    {CdiFormat.money(
                      account.currentLimit.amount,
                      account.currentLimit.currency,
                    )}{" "}
                    current limit
                  </small>
                </td>
                <td>
                  <strong>{CdiFormat.percent(account.evidenceCoverage)}</strong>
                  <small>Health score {account.healthScore}/100</small>
                </td>
                <td>{account.owner}</td>
                <td>
                  <Link
                    href={`/accounts/${account.id}`}
                    aria-label={`Open ${account.name}`}
                  >
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
