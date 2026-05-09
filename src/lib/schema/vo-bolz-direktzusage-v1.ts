import { z } from "zod";
import { sourceRefSchema } from "./source-ref";

const confidenceSchema = z.enum(["low", "medium", "high"]);

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

/** Modell liefert oft Zahlen/Booleans statt Text — für freie String-Felder. */
const jsonNullableString = z.preprocess((v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint")
    return String(v);
  return null;
}, z.string().nullable());

/** Modell darf metadata unvollständig liefern; Server ergänzt extractedAt/modelVersion. */
export const metadataSchema = z.object({
  documentName: z.string(),
  documentDate: jsonNullableString,
  extractedAt: z.string().optional(),
  modelVersion: z.string().optional(),
  confidence: confidenceSchema.optional(),
  /** Vom Server: Länge des Hilfs-Klartexts (pdf-parse o. ä.). */
  sourcePlainTextLength: z.number().int().nonnegative().optional(),
  /** Vom Server: SHA-256 (hex) des Hilfs-Klartexts. */
  sourcePlainTextSha256: z.string().length(64).optional(),
  /** Vom Server: plain_text vs. natives PDF an Claude. */
  documentIngestMode: z.enum(["plain_text", "anthropic_pdf"]).optional(),
  /** Vom Server: SHA-256 (hex) der PDF-Rohdatei bei anthropic_pdf. */
  sourcePdfSha256: z.string().length(64).optional(),
  /** Vom Server: liegen Zitate im mitgelieferten Klartext (pdf-parse) wieder? */
  quoteGrounding: z.enum(["ok", "weak", "skipped"]).optional(),
});

export const schemeSchema = z.object({
  type: z.literal("BoLZ"),
  implementation: z.literal("Direktzusage"),
  openForNewEntries: jsonNullableBoolean,
  closingDate: jsonNullableString,
});

export const openQuestionSchema = z.object({
  topic: z.coerce.string(),
  reason: z.coerce.string(),
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
  type: jsonNullableString,
  rate: jsonNullableNumber,
  base: jsonNullableString,
  salaryDefinition: jsonNullableString,
  salaryCap: jsonNullableString,
  source: sourceRefSchema,
});

export const employeeContributionSchema = z.object({
  type: jsonNullableString,
  maxRate: jsonNullableNumber,
  source: sourceRefSchema,
});

export const contributionsSchema = z.object({
  employerContribution: employerContributionSchema,
  employeeContribution: employeeContributionSchema,
});

export const vestingSchema = z.object({
  rule: jsonNullableString,
  minServiceYears: jsonNullableNumber,
  minAge: jsonNullableNumber,
  source: sourceRefSchema,
});

export const oldAgeBenefitSchema = z.object({
  regularRetirementAge: jsonNullableString,
  earlyRetirementReductionPerMonth: jsonNullableNumber,
  formula: jsonNullableString,
  guaranteedInterest: jsonNullableNumber,
  source: sourceRefSchema,
});

export const disabilityBenefitSchema = z.object({
  qualifying: jsonNullableString,
  formula: jsonNullableString,
  source: sourceRefSchema,
});

export const deathSpouseSchema = z.object({
  rate: jsonNullableNumber,
  remarriage: jsonNullableString,
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
  rule: jsonNullableString,
  method: jsonNullableString,
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
