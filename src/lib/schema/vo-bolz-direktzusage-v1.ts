import { z } from "zod";
import { sourceRefSchema } from "./source-ref";

const confidenceSchema = z.enum(["low", "medium", "high"]);

/** Modell darf metadata unvollständig liefern; Server ergänzt extractedAt/modelVersion. */
export const metadataSchema = z.object({
  documentName: z.string(),
  documentDate: z.string().nullable(),
  extractedAt: z.string().optional(),
  modelVersion: z.string().optional(),
  confidence: confidenceSchema.optional(),
});

const jsonNullableNumber = z.preprocess((v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}, z.number().nullable());

const jsonNullableBoolean = z.preprocess((v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "boolean") return v;
  if (v === "true" || v === "1" || v === 1) return true;
  if (v === "false" || v === "0" || v === 0) return false;
  return null;
}, z.boolean().nullable());

export const schemeSchema = z.object({
  type: z.literal("BoLZ"),
  implementation: z.literal("Direktzusage"),
  openForNewEntries: jsonNullableBoolean,
  closingDate: z.string().nullable(),
});

export const openQuestionSchema = z.object({
  topic: z.string(),
  reason: z.string(),
  urgency: z
    .union([confidenceSchema, z.string()])
    .transform((u) => (u === "low" || u === "medium" || u === "high" ? u : "medium")),
});

const sourcedNumber = z.object({
  value: jsonNullableNumber,
  source: sourceRefSchema,
});

const waitingPeriodSchema = z.object({
  months: jsonNullableNumber,
  source: sourceRefSchema,
});

export const eligibilitySchema = z.object({
  minAge: sourcedNumber,
  waitingPeriod: waitingPeriodSchema,
  excludedGroups: z.array(z.string()).catch([]),
});

export const employerContributionSchema = z.object({
  type: z.string().nullable(),
  rate: jsonNullableNumber,
  base: z.string().nullable(),
  salaryDefinition: z.string().nullable(),
  salaryCap: z.string().nullable(),
  source: sourceRefSchema,
});

export const employeeContributionSchema = z.object({
  type: z.string().nullable(),
  maxRate: jsonNullableNumber,
  source: sourceRefSchema,
});

export const contributionsSchema = z.object({
  employerContribution: employerContributionSchema,
  employeeContribution: employeeContributionSchema,
});

export const vestingSchema = z.object({
  rule: z.string().nullable(),
  minServiceYears: jsonNullableNumber,
  minAge: jsonNullableNumber,
  source: sourceRefSchema,
});

export const oldAgeBenefitSchema = z.object({
  regularRetirementAge: z.string().nullable(),
  earlyRetirementReductionPerMonth: jsonNullableNumber,
  formula: z.string().nullable(),
  guaranteedInterest: jsonNullableNumber,
  source: sourceRefSchema,
});

export const disabilityBenefitSchema = z.object({
  qualifying: z.string().nullable(),
  formula: z.string().nullable(),
  source: sourceRefSchema,
});

export const deathSpouseSchema = z.object({
  rate: jsonNullableNumber,
  remarriage: z.string().nullable(),
  source: sourceRefSchema,
});

export const deathOrphanSchema = z.object({
  halfOrphan: jsonNullableNumber,
  fullOrphan: jsonNullableNumber,
  maxAge: jsonNullableNumber,
  source: sourceRefSchema,
});

export const deathBenefitSchema = z.object({
  spouse: deathSpouseSchema,
  orphan: deathOrphanSchema,
});

export const benefitsSchema = z.object({
  oldAge: oldAgeBenefitSchema,
  disability: disabilityBenefitSchema,
  death: deathBenefitSchema,
});

export const adjustmentSchema = z.object({
  rule: z.string().nullable(),
  method: z.string().nullable(),
  source: sourceRefSchema,
});

export const voBolzDirektzusageV1Schema = z.object({
  metadata: metadataSchema,
  scheme: schemeSchema,
  eligibility: eligibilitySchema,
  contributions: contributionsSchema,
  vesting: vestingSchema,
  benefits: benefitsSchema,
  adjustment: adjustmentSchema,
  openQuestions: z.unknown().transform((v): z.infer<typeof openQuestionSchema>[] => {
    if (!Array.isArray(v)) return [];
    const out: z.infer<typeof openQuestionSchema>[] = [];
    for (const item of v) {
      const p = openQuestionSchema.safeParse(item);
      if (p.success) out.push(p.data);
    }
    return out;
  }),
});

export type VoBolzDirektzusageV1 = z.infer<typeof voBolzDirektzusageV1Schema>;
