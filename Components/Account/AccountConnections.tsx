import { Cable } from "lucide-react";
import type { ConnectorHealth } from "@/Domain/Accounts/CustomerAccount";
import { StatusBadge } from "@/Components/Common/StatusBadge";
import { CdiFormat } from "@/Presentation/Format/CdiFormat";
import styles from "./Account.module.css";

function healthTone(health: ConnectorHealth["health"]) {
  if (health === "HEALTHY") return "positive" as const;
  if (health === "DEGRADED" || health === "STALE") return "warning" as const;
  return "critical" as const;
}

export function AccountConnections({
  connectors,
}: {
  connectors: ConnectorHealth[];
}) {
  return (
    <section className={styles.sidePanel}>
      <div className={styles.panelHeading}>
        <div>
          <span>Source health</span>
          <h2>Connected evidence</h2>
        </div>
        <Cable size={18} aria-hidden="true" />
      </div>
      <div className={styles.connectionList}>
        {connectors.map((connector) => (
          <div key={connector.id} className={styles.connectionItem}>
            <div>
              <strong>{connector.name}</strong>
              <small>
                {connector.lastSyncAt
                  ? `Synced ${CdiFormat.relativeTime(connector.lastSyncAt)}`
                  : "Not yet synchronized"}
              </small>
            </div>
            <StatusBadge tone={healthTone(connector.health)} dot>
              {connector.health}
            </StatusBadge>
          </div>
        ))}
      </div>
    </section>
  );
}
