import { ShieldCheck, Sparkles } from "lucide-react";
import type { PortfolioSnapshot } from "@/Domain/Portfolio/PortfolioSnapshot";
import { CdiFormat } from "@/Presentation/Format/CdiFormat";
import styles from "./Dashboard.module.css";

export function DashboardHeader({
  portfolio,
}: {
  portfolio: PortfolioSnapshot;
}) {
  return (
    <header className={styles.header}>
      <div>
        <div className={styles.kicker}>
          <ShieldCheck size={15} aria-hidden="true" />
          Governed customer operations
        </div>
        <h1>Control center</h1>
        <p>
          Find customer friction and safe expansion opportunities, then route
          the next action through the active Decionis policy.
        </p>
      </div>
      <div className={styles.evidenceNote}>
        <Sparkles size={18} aria-hidden="true" />
        <div>
          <strong>Evidence adapts. Authority stays deterministic.</strong>
          <span>
            Snapshot refreshed {CdiFormat.relativeTime(portfolio.generatedAt)}
          </span>
        </div>
      </div>
    </header>
  );
}
