import { describe, expect, it } from "vitest";

import {
  accumulateEmployerContributionsBbgCapped,
  calculateDeathBenefitsSkeleton,
  calculateEarlyExitWithVestingSkeleton,
  calculateOldAgeBenefitSkeleton,
} from "@/lib/calculation";

describe("Berechnungs-Engine (Skelett)", () => {
  it("kappt Gehalt an die BBG und summiert Arbeitgeberbeiträge", () => {
    const res = accumulateEmployerContributionsBbgCapped(
      [
        {
          calendarYear: 2024,
          grossAnnualSalaryEur: 120_000,
          region: "west",
        },
      ],
      { employerRate: 0.04 },
    );
    expect(res.totalContributionsEur).toBeCloseTo(90600 * 0.04, 5);
  });

  it("berechnet eine Altersleistung inkl. linearer Aufzinsung und Vorzeitfaktor", () => {
    const oldAge = calculateOldAgeBenefitSkeleton({
      salaryHistory: [
        { calendarYear: 2023, grossAnnualSalaryEur: 90_000, region: "west" },
        { calendarYear: 2024, grossAnnualSalaryEur: 95_000, region: "west" },
      ],
      contributionParams: { employerRate: 0.04 },
      guaranteedAnnualInterestRate: 0.0125,
      valuationYear: 2026,
      earlyRetirementMonthsBeforeNra: 12,
      earlyRetirementReductionPerMonth: 0.003,
    });
    expect(oldAge.grossBenefitEur).not.toBeNull();
    expect(oldAge.steps.some((s) => s.key === "oldAge.earlyReduction")).toBe(true);
  });

  it("liefert Hinterbliebenen-Split aus Bezugsleistung", () => {
    const death = calculateDeathBenefitsSkeleton({
      referenceBenefitEur: 100_000,
      spouseRate: 0.6,
      orphanHalfRate: 0.1,
      orphanFullRate: 0.2,
    });
    expect(death.grossBenefitEur).toBeCloseTo(60_000 + 10_000 + 20_000, 5);
  });

  it("gibt bei fehlender Unverfallbarkeit 0 für vorzeitiges Ausscheiden zurück", () => {
    const exit = calculateEarlyExitWithVestingSkeleton({
      salaryHistory: [
        { calendarYear: 2024, grossAnnualSalaryEur: 80_000, region: "west" },
      ],
      contributionParams: { employerRate: 0.04 },
      guaranteedAnnualInterestRate: 0.0125,
      valuationYear: 2026,
      isVested: false,
    });
    expect(exit.grossBenefitEur).toBe(0);
  });
});
