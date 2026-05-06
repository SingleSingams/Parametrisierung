import {
  BBG_ANNUAL_TABLE,
  type BbgAnnualRow,
  getBbgAnnualRow,
} from "@/lib/reference-data/bbg-table";

export type BbgRegion = "west" | "east";

export type BbgTarifVariant = "arbeitnehmer" | "angestellte";

export const BBG_ANNUAL_YEAR_MIN = BBG_ANNUAL_TABLE[0]!.year;
export const BBG_ANNUAL_YEAR_MAX = BBG_ANNUAL_TABLE[BBG_ANNUAL_TABLE.length - 1]!.year;

/**
 * Jährliche BBG in EUR für die allgemeine Rentenversicherung (ohne Knappschafts-Sonderlogik).
 * Standard für typische bAV-Texte „BBG DRV West“: `region: west`, `variant: arbeitnehmer`.
 */
export function getBbgRentenversicherungAnnualEur(
  calendarYear: number,
  region: BbgRegion,
  variant: BbgTarifVariant = "arbeitnehmer",
): number {
  const row = getBbgAnnualRow(calendarYear);
  if (!row) {
    throw new RangeError(
      `Keine BBG hinterlegt für ${calendarYear} (unterstützt ${BBG_ANNUAL_YEAR_MIN}–${BBG_ANNUAL_YEAR_MAX}).`,
    );
  }
  const useWest = region === "west";
  if (variant === "arbeitnehmer") {
    return useWest ? row.westArbeitnehmerAnnualEur : row.eastArbeitnehmerAnnualEur;
  }
  return useWest ? row.westAngestellteAnnualEur : row.eastAngestellteAnnualEur;
}

export function getBbgRowOrThrow(year: number): BbgAnnualRow {
  const row = getBbgAnnualRow(year);
  if (!row) {
    throw new RangeError(`Keine BBG-Zeile für Jahr ${year}.`);
  }
  return row;
}
