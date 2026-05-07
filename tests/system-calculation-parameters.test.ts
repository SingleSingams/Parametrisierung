import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { buildSystemCalculationParameterRows } from "@/lib/presenters/system-calculation-parameters";
import { voBolzDirektzusageV1Schema } from "@/lib/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const goldPath = path.join(
  __dirname,
  "fixtures/synthetic-bolz-direktzusage/gold-extraction.json",
);

describe("buildSystemCalculationParameterRows", () => {
  it("liefert eine flache Implementierungsliste mit Kurzcodes und JSON-Pfaden", () => {
    const raw = JSON.parse(readFileSync(goldPath, "utf8")) as unknown;
    const parsed = voBolzDirektzusageV1Schema.parse(raw);
    const rows = buildSystemCalculationParameterRows(parsed);
    const paths = rows.map((r) => r.schemaPath);
    expect(paths).toContain("contributions.employerContribution.rate");
    expect(paths).toContain("benefits.oldAge.guaranteedInterest");
    expect(rows.some((r) => r.code === "BG_AG_SATZ")).toBe(true);
    expect(rows.length).toBeGreaterThanOrEqual(20);
    const rateRow = rows.find(
      (r) => r.schemaPath === "contributions.employerContribution.rate",
    );
    expect(rateRow?.status).toBe("ok");
  });
});
