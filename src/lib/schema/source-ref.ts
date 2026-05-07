import { z } from "zod";

/** Seite oft als Zahl oder String; Zitate können lang sein (wird gekürzt). */
export const sourceRefSchema = z.object({
  page: z.union([z.number(), z.string(), z.null()]).transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "string" ? parseInt(v, 10) : v;
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) return Math.floor(n);
    return null;
  }),
  para: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  quote: z
    .string()
    .nullish()
    .transform((v) => {
      if (v == null) return null;
      return v.length > 2000 ? `${v.slice(0, 1997)}...` : v;
    }),
});

export type SourceRef = z.infer<typeof sourceRefSchema>;
