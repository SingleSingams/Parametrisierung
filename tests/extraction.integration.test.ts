import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { extractVoParams } from "@/lib/extraction/extract-vo-params";
import { voBolzDirektzusageV1Schema } from "@/lib/schema";
import { getCriticalFieldMismatches } from "@/lib/validation/compare-critical-fields";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(__dirname, "fixtures/synthetic-bolz-direktzusage");
const voPath = path.join(fixtureDir, "vo-muster-ag.txt");
const goldPath = path.join(fixtureDir, "gold-extraction.json");

const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);

describe("Extraktion vs. Gold (Integration)", () => {
  it.skipIf(!hasAnthropicKey)(
    "KI-Extraktion der synthetischen VO trifft Kernfelder der Gold-Fixture",
    async () => {
      const documentText = readFileSync(voPath, "utf8");
      const goldRaw = JSON.parse(readFileSync(goldPath, "utf8")) as unknown;
      const gold = voBolzDirektzusageV1Schema.parse(goldRaw);

      const actual = await extractVoParams({
        documentText,
        documentName: "vo-muster-ag.txt",
      });

      const mismatches = getCriticalFieldMismatches(actual, gold);
      expect(
        mismatches,
        mismatches.length ? `Abweichungen:\n${mismatches.join("\n")}` : "",
      ).toEqual([]);
    },
    180_000,
  );
});
