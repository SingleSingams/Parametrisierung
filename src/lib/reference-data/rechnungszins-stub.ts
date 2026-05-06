/**
 * Platzhalter für historische Rechnungszinsen / Diskontierung (POC).
 * Später: Tabellen aus Heubeck bzw. interne Aktuarsätze.
 */
export type RechnungszinsStub = {
  /** Kalenderjahr, für das der Satz typischerweise angewendet wird */
  calendarYear: number;
  /** nomineller Jahreszinssatz, z. B. 0.0125 für 1,25 % p.a. */
  annualRate: number;
  /** Freitext-Herkunft */
  note: string;
};

/** Minimaler Demo-Satz (keine historische Vollständigkeit). */
export const DEFAULT_GUARANTEED_ANNUAL_RATE = 0.0125;

export function getRechnungszinsStub(calendarYear: number): RechnungszinsStub {
  return {
    calendarYear,
    annualRate: DEFAULT_GUARANTEED_ANNUAL_RATE,
    note: "Stub: fester Demo-Satz 1,25 % p.a.; echte historische Sätze folgen in Phase 2.",
  };
}
