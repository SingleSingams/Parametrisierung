import { accumulateEmployerContributionsBbgCapped } from "./contribution-accumulation";
import type {
  BenefitComputationResult,
  BoLzEmployerContributionParams,
  CalculationStep,
  SalaryHistoryEntry,
} from "./types";

export type OldAgeSkeletonInput = {
  salaryHistory: readonly SalaryHistoryEntry[];
  contributionParams: BoLzEmployerContributionParams;
  /** Garantierter Rechnungszins p.a. (Dezimalzahl), z. B. 0,0125. */
  guaranteedAnnualInterestRate: number;
  /** Bezugsjahr für eine lineare Aufzinsung der Summe (POC-Vereinfachung). */
  valuationYear: number;
  /** Volle Monate vor Regelaltersgrenze (0 = keine Kürzung). */
  earlyRetirementMonthsBeforeNra: number;
  /** Kürzung pro Monat als Dezimalzahl, z. B. 0,003 für 0,3 %. */
  earlyRetirementReductionPerMonth: number;
};

export type DisabilitySkeletonInput = Omit<
  OldAgeSkeletonInput,
  "earlyRetirementMonthsBeforeNra" | "earlyRetirementReductionPerMonth"
>;

export type DeathSkeletonInput = {
  /** Bezugsgröße: z. B. projizierte Altersleistung oder Deckungskapital-Skelett. */
  referenceBenefitEur: number;
  spouseRate: number;
  orphanHalfRate: number;
  orphanFullRate: number;
};

export type EarlyExitSkeletonInput = {
  salaryHistory: readonly SalaryHistoryEntry[];
  contributionParams: BoLzEmployerContributionParams;
  guaranteedAnnualInterestRate: number;
  valuationYear: number;
  /** true, wenn laut VO bereits unverfallbare Anwartschaft besteht (POC: nur Flag). */
  isVested: boolean;
};

function applyLinearInterestToTotal(
  baseEur: number,
  firstYear: number,
  lastYear: number,
  annualRate: number,
  steps: CalculationStep[],
): number {
  const span = Math.max(1, lastYear - firstYear + 1);
  const uplifted = baseEur * (1 + annualRate * span);
  steps.push({
    key: "interest.linear",
    label: "Aufzinsung (linear, POC-Skelett)",
    valueEur: uplifted - baseEur,
    detail: `Summe × (1 + ${(annualRate * 100).toFixed(2)} % × ${span} Jahre)`,
  });
  steps.push({
    key: "capital.afterInterest",
    label: "Kapital nach Aufzinsung (Skelett)",
    valueEur: uplifted,
  });
  return uplifted;
}

function applyEarlyRetirementFactor(
  capital: number,
  months: number,
  reductionPerMonth: number,
  steps: CalculationStep[],
): number {
  if (months <= 0) return capital;
  const factor = Math.max(0, 1 - reductionPerMonth * months);
  const reduced = capital * factor;
  steps.push({
    key: "oldAge.earlyReduction",
    label: "Abschlag vorzeitiger Rentenbeginn (Monate × Satz)",
    detail: `${months} Monate × ${(reductionPerMonth * 100).toFixed(2)} % = Faktor ${factor.toFixed(4)}`,
  });
  steps.push({
    key: "oldAge.afterEarly",
    label: "Leistung nach Abschlag",
    valueEur: reduced,
  });
  return reduced;
}

/**
 * Altersleistung (Skelett): kumulierte Beiträge, lineare Zinsstaffel, fiktive Vorzeit-Kürzung.
 * Keine Biometrie, keine Umwandlung in Rente — nur nachvollziehbare Zwischenschritte.
 */
export function calculateOldAgeBenefitSkeleton(
  input: OldAgeSkeletonInput,
): BenefitComputationResult {
  const steps: CalculationStep[] = [];
  if (!input.salaryHistory.length) {
    steps.push({
      key: "oldAge.noHistory",
      label: "Keine Gehaltshistorie übergeben",
    });
    return { benefitType: "oldAge", grossBenefitEur: null, steps };
  }
  const { totalContributionsEur, steps: cSteps } =
    accumulateEmployerContributionsBbgCapped(
      input.salaryHistory,
      input.contributionParams,
    );
  steps.push(...cSteps);

  const years = input.salaryHistory.map((h) => h.calendarYear);
  const firstYear = Math.min(...years);
  const uplifted = applyLinearInterestToTotal(
    totalContributionsEur,
    firstYear,
    input.valuationYear,
    input.guaranteedAnnualInterestRate,
    steps,
  );

  const finalAmount = applyEarlyRetirementFactor(
    uplifted,
    input.earlyRetirementMonthsBeforeNra,
    input.earlyRetirementReductionPerMonth,
    steps,
  );

  return {
    benefitType: "oldAge",
    grossBenefitEur: finalAmount,
    steps,
  };
}

/** Invalidität: gleiche Kapitalbasis wie Alter, aber ohne Vorzeit-Abschlag. */
export function calculateDisabilityBenefitSkeleton(
  input: DisabilitySkeletonInput,
): BenefitComputationResult {
  const base = calculateOldAgeBenefitSkeleton({
    ...input,
    earlyRetirementMonthsBeforeNra: 0,
    earlyRetirementReductionPerMonth: 0,
  });
  return { ...base, benefitType: "disability" };
}

/** Hinterbliebene: feste Sätze auf Bezugsleistung (ohne Witwen-Splitting-Logik). */
export function calculateDeathBenefitsSkeleton(
  input: DeathSkeletonInput,
): BenefitComputationResult {
  const steps: CalculationStep[] = [];
  const spouse = input.referenceBenefitEur * input.spouseRate;
  steps.push({
    key: "death.spouse",
    label: "Witwen-/Witwerleistung (Skelett)",
    valueEur: spouse,
    detail: `${input.referenceBenefitEur.toFixed(2)} € × ${(input.spouseRate * 100).toFixed(0)} %`,
  });
  const half = input.referenceBenefitEur * input.orphanHalfRate;
  const full = input.referenceBenefitEur * input.orphanFullRate;
  steps.push({
    key: "death.orphan.half",
    label: "Halbwaisenrente (Skelett)",
    valueEur: half,
  });
  steps.push({
    key: "death.orphan.full",
    label: "Vollwaisenrente (Skelett)",
    valueEur: full,
  });
  return {
    benefitType: "death",
    grossBenefitEur: spouse + half + full,
    steps,
  };
}

/**
 * Vorzeitiges Ausscheiden mit Unverfallbarkeit: Auszahlung/Anwartschaft als Kapital-Skelett.
 * Ohne Steuer/Sozialabgaben, ohne Ablöseformeln — nur Summe inkl. linearer Zinsen.
 */
export function calculateEarlyExitWithVestingSkeleton(
  input: EarlyExitSkeletonInput,
): BenefitComputationResult {
  const steps: CalculationStep[] = [];
  if (!input.salaryHistory.length) {
    steps.push({
      key: "exit.noHistory",
      label: "Keine Gehaltshistorie übergeben",
    });
    return {
      benefitType: "earlyExitWithVesting",
      grossBenefitEur: null,
      steps,
    };
  }
  if (!input.isVested) {
    steps.push({
      key: "exit.notVested",
      label: "Keine unverfallbare Anwartschaft (laut Eingabe)",
      valueEur: 0,
    });
    return { benefitType: "earlyExitWithVesting", grossBenefitEur: 0, steps };
  }

  const { totalContributionsEur, steps: cSteps } =
    accumulateEmployerContributionsBbgCapped(
      input.salaryHistory,
      input.contributionParams,
    );
  steps.push(...cSteps);
  const years = input.salaryHistory.map((h) => h.calendarYear);
  const firstYear = Math.min(...years);
  const uplifted = applyLinearInterestToTotal(
    totalContributionsEur,
    firstYear,
    input.valuationYear,
    input.guaranteedAnnualInterestRate,
    steps,
  );

  return {
    benefitType: "earlyExitWithVesting",
    grossBenefitEur: uplifted,
    steps,
  };
}
