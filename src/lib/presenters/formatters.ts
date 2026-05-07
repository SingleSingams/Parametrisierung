/** Anzeige-Helfer für die UI (de-DE). */

export function formatDash(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

export function formatPercentFromDecimal(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const pct = value * 100;
  return `${pct.toLocaleString("de-DE", { maximumFractionDigits: 4 })} %`;
}

export function formatEur(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumberDe(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toLocaleString("de-DE", { maximumFractionDigits: 6 });
}

export function confidenceDe(c: "low" | "medium" | "high" | undefined): string {
  if (c === "low") return "niedrig";
  if (c === "high") return "hoch";
  if (c === "medium") return "mittel";
  return "—";
}
