import { History } from "lucide-react";
import type { AccountTimelineEvent } from "@/Domain/Accounts/CustomerAccount";
import { CdiFormat } from "@/Presentation/Format/CdiFormat";
import styles from "./Account.module.css";

export function AccountTimeline({
  events,
}: {
  events: AccountTimelineEvent[];
}) {
  return (
    <section className={styles.sidePanel}>
      <div className={styles.panelHeading}>
        <div>
          <span>Decision memory</span>
          <h2>Account timeline</h2>
        </div>
        <History size={18} aria-hidden="true" />
      </div>
      <ol className={styles.timeline}>
        {events.map((event) => (
          <li key={event.id}>
            <span aria-hidden="true" />
            <div>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
              <small>
                {event.kind} · {CdiFormat.relativeTime(event.occurredAt)}
              </small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
