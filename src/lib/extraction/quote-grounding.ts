import type { VoBolzDirektzusageV1 } from "@/lib/schema";

export type QuoteGroundingLevel = "ok" | "weak" | "skipped";

function fold(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[„“"'`´]/g, "")
    .trim();
}

function collectQuotes(v: unknown, out: string[]): void {
  if (v === null || v === undefined) return;
  if (typeof v !== "object") return;
  if (Array.isArray(v)) {
    for (const x of v) collectQuotes(x, out);
    return;
  }
  const o = v as Record<string, unknown>;
  if ("source" in o && o.source && typeof o.source === "object") {
    const src = o.source as Record<string, unknown>;
    const q = src.quote;
    if (typeof q === "string") {
      const t = q.trim();
      if (t.length >= 12) out.push(t);
    }
  }
  for (const [k, val] of Object.entries(o)) {
    if (k === "source") continue;
    if (val && typeof val === "object") collectQuotes(val, out);
  }
}

function quoteInHay(quote: string, hayFolded: string): boolean {
  const q = fold(quote);
  if (q.length < 12) return true;
  const needle = q.slice(0, Math.min(72, q.length));
  return hayFolded.includes(needle);
}

/**
 * Prüft, ob nicht-triviale `source.quote`-Texte im **mitgelieferten Klartext** vorkommen.
 * Bei nativem PDF mit leerem Textlayer ist das oft `skipped` — dann keine automatische Verwerfung.
 */
export function assessQuoteGroundingInPlainText(
  data: VoBolzDirektzusageV1,
  documentPlainText: string,
): { level: QuoteGroundingLevel; checked: number; failed: number } {
  const hay = fold(documentPlainText);
  if (hay.length < 100) {
    return { level: "skipped", checked: 0, failed: 0 };
  }

  const quotes: string[] = [];
  collectQuotes(data, quotes);

  if (quotes.length === 0) {
    return { level: "weak", checked: 0, failed: 0 };
  }

  let failed = 0;
  for (const q of quotes) {
    if (!quoteInHay(q, hay)) failed++;
  }

  const level: QuoteGroundingLevel = failed === 0 ? "ok" : "weak";

  return { level, checked: quotes.length, failed };
}
