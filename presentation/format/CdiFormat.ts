export class CdiFormat {
  static percent(value: number, maximumFractionDigits = 0): string {
    return new Intl.NumberFormat("en", {
      style: "percent",
      maximumFractionDigits,
    }).format(value / 100);
  }

  static confidence(value: number): string {
    return new Intl.NumberFormat("en", {
      style: "percent",
      maximumFractionDigits: 0,
    }).format(value);
  }

  static money(amount: number, currency: string): string {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: amount >= 1_000_000 ? "compact" : "standard",
    }).format(amount);
  }

  static relativeTime(
    value: string,
    now = new Date("2026-07-10T15:30:00.000Z"),
  ): string {
    const differenceMinutes = Math.round(
      (new Date(value).getTime() - now.getTime()) / 60_000,
    );
    const absoluteMinutes = Math.abs(differenceMinutes);
    if (absoluteMinutes < 60) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        differenceMinutes,
        "minute",
      );
    }
    const differenceHours = Math.round(differenceMinutes / 60);
    if (Math.abs(differenceHours) < 24) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        differenceHours,
        "hour",
      );
    }
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  }
}
