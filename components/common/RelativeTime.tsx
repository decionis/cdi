import { StewardFormat } from "@/presentation/format/StewardFormat";

/**
 * Renders a timestamp as "5 minutes ago" inside a semantic `<time>` element.
 *
 * Two things this centralises.
 *
 * The clock. `StewardFormat.relativeTime` takes `now` as a required argument — it
 * used to default to a hardcoded fixture date, which meant every timestamp in
 * live mode was measured against a fixed point in the past. One component owns
 * calling `new Date()` now, so a single render measures everything against the
 * same instant rather than drifting between rows.
 *
 * The markup. A bare string tells a screen reader nothing an assistive
 * technology can re-interpret, and nothing a machine can parse. `<time
 * dateTime>` carries the exact instant alongside the human phrasing, and the
 * title attribute surfaces it on hover for a sighted operator deciding whether
 * evidence is fresh enough to act on.
 *
 * This is a server component. Calling `new Date()` here renders once on the
 * server with no hydration mismatch. If it ever needs to live in a client
 * component, the relative label must be computed after mount instead — the
 * server and client clocks will not agree.
 */

const ABSOLUTE = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function RelativeTime({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const instant = new Date(value);

  return (
    <time
      dateTime={value}
      title={`${ABSOLUTE.format(instant)} UTC`}
      className={className}
    >
      {StewardFormat.relativeTime(value, new Date())}
    </time>
  );
}
