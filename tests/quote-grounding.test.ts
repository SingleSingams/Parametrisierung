import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { assessQuoteGroundingInPlainText } from "@/lib/extraction/quote-grounding";
import { voBolzDirektzusageV1Schema } from "@/lib/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(__dirname, "fixtures/synthetic-bolz-direktzusage");
const goldPath = path.join(fixtureDir, "gold-extraction.json");
const voPath = path.join(fixtureDir, "vo-muster-ag.txt");

describe("assessQuoteGroundingInPlainText", () => {
  it("erkennt konsistente Zitate im VO-Klartext", () => {
    const gold = voBolzDirektzusageV1Schema.parse(
      JSON.parse(readFileSync(goldPath, "utf8")) as unknown,
    );
    const text = readFileSync(voPath, "utf8");
    const r = assessQuoteGroundingInPlainText(gold, text);
    expect(r.level).toBe("ok");
    expect(r.checked).toBeGreaterThan(0);
    expect(r.failed).toBe(0);
  });

  it("markiert abweichende Zitate als weak", () => {
    const gold = voBolzDirektzusageV1Schema.parse(
      JSON.parse(readFileSync(goldPath, "utf8")) as unknown,
    );
    gold.contributions.employerContribution.source.quote =
      "Dieser Satz kommt garantiert nicht in der Muster-VO vor.";
    const text = readFileSync(voPath, "utf8");
    const r = assessQuoteGroundingInPlainText(gold, text);
    expect(r.level).toBe("weak");
    expect(r.failed).toBeGreaterThan(0);
  });
});
