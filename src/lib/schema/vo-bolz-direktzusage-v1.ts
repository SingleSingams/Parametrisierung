import { z } from "zod";
import { sourceRefSchema } from "./source-ref";

const confidenceSchema = z.enum(["low", "medium", "high"]);

export const metadataSchema = z.object({
  documentName: z.string(),
  documentDate: z.string().nullable(),
  extractedAt: z.string(),
  modelVersion: z.string(),
  confidence: confidenceSchema,
  /** Vom Server gesetzt: Länge des an das Modell übergebenen Klartexts (Transparenz / Debugging). */
  sourcePlainTextLength: z.number().int().nonnegative().optional(),
  /** SHA-256 (hex) des Klartexts — gleicher Hash bei verschiedenen Dateinamen = gleicher Textinhalt. */
  sourcePlainTextSha256: z.string().length(64).optional(),
  /** Wie das Dokument an Claude übergeben wurde (vom Server gesetzt). */
  documentIngestMode: z.enum(["plain_text", "anthropic_pdf"]).optional(),
  /** SHA-256 (hex) der PDF-Rohdatei, nur bei `anthropic_pdf`. */
  sourcePdfSha256: z.string().length(64).optional(),
});

export const schemeSchema = z.object({
  type: z.literal("BoLZ"),
  implementation: z.literal("Direktzusage"),
  openForNewEntries: z.boolean().nullable(),
  closingDate: z.string().nullable(),
});

export const openQuestionSchema = z.object({
  topic: z.string(),
  reason: z.string(),
  urgency: z.enum(["low", "medium", "high"]),
});

const sourcedNumber = z.object({
  value: z.number().nullable(),
  source: sourceRefSchema,
});

const waitingPeriodSchema = z.object({
  months: z.number().nullable(),
  source: sourceRefSchema,
});

export const eligibilitySchema = z.object({
  minAge: sourcedNumber,
  waitingPeriod: waitingPeriodSchema,
  excludedGroups: z.array(z.string()),
});

export const employerContributionSchema = z.object({
  type: z.string().nullable(),
  rate: z.number().nullable(),
  base: z.string().nullable(),
  salaryDefinition: z.string().nullable(),
  salaryCap: z.string().nullable(),
  source: sourceRefSchema,
});

export const employeeContributionSchema = z.object({
  type: z.string().nullable(),
  maxRate: z.number().nullable(),
  source: sourceRefSchema,
});

export const contributionsSchema = z.object({
  employerContribution: employerContributionSchema,
  employeeContribution: employeeContributionSchema,
});

export const vestingSchema = z.object({
  rule: z.string().nullable(),
  minServiceYears: z.number().nullable(),
  minAge: z.number().nullable(),
  source: sourceRefSchema,
});

export const oldAgeBenefitSchema = z.object({
  regularRetirementAge: z.string().nullable(),
  earlyRetirementReductionPerMonth: z.number().nullable(),
  formula: z.string().nullable(),
  guaranteedInterest: z.number().nullable(),
  source: sourceRefSchema,
});

export const disabilityBenefitSchema = z.object({
  qualifying: z.string().nullable(),
  formula: z.string().nullable(),
  source: sourceRefSchema,
});

export const deathSpouseSchema = z.object({
  rate: z.number().nullable(),
  remarriage: z.string().nullable(),
  source: sourceRefSchema,
});

export const deathOrphanSchema = z.object({
  halfOrphan: z.number().nullable(),
  fullOrphan: z.number().nullable(),
  maxAge: z.number().nullable(),
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
  openQuestions: z.array(openQuestionSchema),
});

export type VoBolzDirektzusageV1 = z.infer<typeof voBolzDirektzusageV1Schema>;
