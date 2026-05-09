import { getBbgRentenversicherungAnnualEur } from "@/lib/reference-data/bbg-service";

import type {
  BoLzEmployerContributionParams,
  CalculationStep,
  SalaryHistoryEntry,
} from "./types";

export type ContributionAccumulationResult = {
  totalContributionsEur: number;
  steps: CalculationStep[];
};

/**
 * Summiert Arbeitgeberbeiträge als Prozentsatz des BBG-gekappten Bruttos.
 * Deterministisch, ohne KI — Grundlage für weitere Leistungsarten.
 */
export function accumulateEmployerContributionsBbgCapped(
  history: readonly SalaryHistoryEntry[],
  params: BoLzEmployerContributionParams,
): ContributionAccumulationResult {
  const variant = params.bbgVariant ?? "arbeitnehmer";
  const steps: CalculationStep[] = [];
  let total = 0;

  for (const row of history) {
    const bbg = getBbgRentenversicherungAnnualEur(
      row.calendarYear,
      row.region,
      variant,
    );
    const capped = Math.min(row.grossAnnualSalaryEur, bbg);
    const contrib = capped * params.employerRate;
    total += contrib;
    steps.push({
      key: `contrib.${row.calendarYear}`,
      label: `Arbeitgeberbeitrag ${row.calendarYear}`,
      valueEur: contrib,
      detail: `min(Brutto ${row.grossAnnualSalaryEur.toFixed(2)} €, BBG ${bbg.toFixed(2)} €) × ${(params.employerRate * 100).toFixed(2)} % = ${contrib.toFixed(2)} €`,
    });
  }

  steps.push({
    key: "contrib.total",
    label: "Summe Arbeitgeberbeiträge (gekappt)",
    valueEur: total,
  });

  return { totalContributionsEur: total, steps };
}
