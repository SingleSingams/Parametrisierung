import { z } from "zod";

/** Zitat und Fundstelle pro extrahiertem Wert (Anti-Halluzination). */
export const sourceRefSchema = z.object({
  page: z.number().int().positive().nullable(),
  para: z.string().nullable(),
  quote: z.string().max(500).nullable(),
});

export type SourceRef = z.infer<typeof sourceRefSchema>;
