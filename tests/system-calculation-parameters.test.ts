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
  it("liefert eine flache Implementierungsliste mit erwarteten Schlüsseln", () => {
    const raw = JSON.parse(readFileSync(goldPath, "utf8")) as unknown;
    const parsed = voBolzDirektzusageV1Schema.parse(raw);
    const rows = buildSystemCalculationParameterRows(parsed);
    const keys = rows.map((r) => r.systemKey);
    expect(keys).toContain("contributions.employerContribution.rate");
    expect(keys).toContain("benefits.oldAge.guaranteedInterest");
    expect(rows.length).toBeGreaterThanOrEqual(20);
    const rateRow = rows.find(
      (r) => r.systemKey === "contributions.employerContribution.rate",
    );
    expect(rateRow?.status).toBe("ok");
  });
});
