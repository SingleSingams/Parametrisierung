import type { VoBolzDirektzusageV1 } from "@/lib/schema";

/**
 * Vergleicht ausgewählte fachliche Kernfelder (ohne Metadaten und ohne wörtliche Quellen),
 * geeignet für Regression gegen eine Gold-Fixture nach KI-Extraktion.
 */
export function getCriticalFieldMismatches(
  actual: VoBolzDirektzusageV1,
  gold: VoBolzDirektzusageV1,
): string[] {
  const out: string[] = [];
  const eq = (path: string, a: unknown, b: unknown) => {
    if (a !== b) out.push(`${path}: erwartet ${String(b)}, ist ${String(a)}`);
  };

  eq("scheme.type", actual.scheme.type, gold.scheme.type);
  eq("scheme.implementation", actual.scheme.implementation, gold.scheme.implementation);
  eq(
    "scheme.openForNewEntries",
    actual.scheme.openForNewEntries,
    gold.scheme.openForNewEntries,
  );
  eq("scheme.closingDate", actual.scheme.closingDate, gold.scheme.closingDate);

  eq(
    "eligibility.minAge.value",
    actual.eligibility.minAge.value,
    gold.eligibility.minAge.value,
  );
  eq(
    "eligibility.waitingPeriod.months",
    actual.eligibility.waitingPeriod.months,
    gold.eligibility.waitingPeriod.months,
  );
  const ag = [...actual.eligibility.excludedGroups].sort().join("|");
  const gg = [...gold.eligibility.excludedGroups].sort().join("|");
  if (ag !== gg) {
    out.push(`eligibility.excludedGroups: erwartet [${gg}], ist [${ag}]`);
  }

  eq(
    "contributions.employerContribution.type",
    actual.contributions.employerContribution.type,
    gold.contributions.employerContribution.type,
  );
  eq(
    "contributions.employerContribution.rate",
    actual.contributions.employerContribution.rate,
    gold.contributions.employerContribution.rate,
  );
  eq(
    "contributions.employerContribution.base",
    actual.contributions.employerContribution.base,
    gold.contributions.employerContribution.base,
  );
  eq(
    "contributions.employerContribution.salaryDefinition",
    actual.contributions.employerContribution.salaryDefinition,
    gold.contributions.employerContribution.salaryDefinition,
  );
  eq(
    "contributions.employerContribution.salaryCap",
    actual.contributions.employerContribution.salaryCap,
    gold.contributions.employerContribution.salaryCap,
  );
  eq(
    "contributions.employeeContribution.type",
    actual.contributions.employeeContribution.type,
    gold.contributions.employeeContribution.type,
  );
  eq(
    "contributions.employeeContribution.maxRate",
    actual.contributions.employeeContribution.maxRate,
    gold.contributions.employeeContribution.maxRate,
  );

  eq("vesting.rule", actual.vesting.rule, gold.vesting.rule);
  eq(
    "vesting.minServiceYears",
    actual.vesting.minServiceYears,
    gold.vesting.minServiceYears,
  );
  eq("vesting.minAge", actual.vesting.minAge, gold.vesting.minAge);

  eq(
    "benefits.oldAge.regularRetirementAge",
    actual.benefits.oldAge.regularRetirementAge,
    gold.benefits.oldAge.regularRetirementAge,
  );
  eq(
    "benefits.oldAge.earlyRetirementReductionPerMonth",
    actual.benefits.oldAge.earlyRetirementReductionPerMonth,
    gold.benefits.oldAge.earlyRetirementReductionPerMonth,
  );
  eq(
    "benefits.oldAge.guaranteedInterest",
    actual.benefits.oldAge.guaranteedInterest,
    gold.benefits.oldAge.guaranteedInterest,
  );

  eq(
    "benefits.disability.qualifying",
    actual.benefits.disability.qualifying,
    gold.benefits.disability.qualifying,
  );

  eq(
    "benefits.death.spouse.rate",
    actual.benefits.death.spouse.rate,
    gold.benefits.death.spouse.rate,
  );
  eq(
    "benefits.death.spouse.remarriage",
    actual.benefits.death.spouse.remarriage,
    gold.benefits.death.spouse.remarriage,
  );
  eq(
    "benefits.death.orphan.halfOrphan",
    actual.benefits.death.orphan.halfOrphan,
    gold.benefits.death.orphan.halfOrphan,
  );
  eq(
    "benefits.death.orphan.fullOrphan",
    actual.benefits.death.orphan.fullOrphan,
    gold.benefits.death.orphan.fullOrphan,
  );
  eq(
    "benefits.death.orphan.maxAge",
    actual.benefits.death.orphan.maxAge,
    gold.benefits.death.orphan.maxAge,
  );

  eq("adjustment.rule", actual.adjustment.rule, gold.adjustment.rule);
  eq("adjustment.method", actual.adjustment.method, gold.adjustment.method);

  return out;
}
