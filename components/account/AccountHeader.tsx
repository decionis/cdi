import Link from "next/link";
import { ArrowLeft, Gauge, MapPin } from "lucide-react";
import type { CustomerAccount } from "@/domain/accounts/CustomerAccount";
import { CdiFormat } from "@/presentation/format/CdiFormat";
import { StatusBadge } from "@/components/common/StatusBadge";
import styles from "./Account.module.css";

function accountTone(state: CustomerAccount["state"]) {
  if (state === "HEALTHY") return "positive" as const;
  if (state === "FRICTION") return "critical" as const;
  if (state === "EXPANSION_READY") return "violet" as const;
  return "warning" as const;
}

export function AccountHeader({ account }: { account: CustomerAccount }) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={15} aria-hidden="true" />
        Portfolio
      </Link>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.titleMeta}>
            <StatusBadge tone={accountTone(account.state)} dot>
              {account.state.replaceAll("_", " ")}
            </StatusBadge>
            <span>{account.externalReference}</span>
          </div>
          <h1>{account.name}</h1>
          <p>
            {account.segment} · {account.owner} ·{" "}
            {account.corridors.join(" · ")}
          </p>
        </div>
        <div className={styles.limitCard}>
          <div>
            <Gauge size={17} aria-hidden="true" />
            <span>Processing envelope</span>
          </div>
          <strong>
            {CdiFormat.percent(account.limitUtilization)} utilized
          </strong>
          <small>
            {CdiFormat.money(
              account.currentLimit.amount,
              account.currentLimit.currency,
            )}{" "}
            current
            {account.proposedLimit
              ? ` · ${CdiFormat.money(account.proposedLimit.amount, account.proposedLimit.currency)} proposed`
              : ""}
          </small>
        </div>
      </div>
      <div className={styles.regionLine}>
        <MapPin size={14} aria-hidden="true" />
        {account.primaryRegion}
      </div>
    </header>
  );
}
