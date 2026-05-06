import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { voBolzDirektzusageV1Schema } from "@/lib/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(__dirname, "fixtures/synthetic-bolz-direktzusage");
const goldPath = path.join(fixtureDir, "gold-extraction.json");

describe("synthetic BoLZ gold fixture", () => {
  it("validiert gegen Zod-Schema", () => {
    const raw = JSON.parse(readFileSync(goldPath, "utf8")) as unknown;
    const parsed = voBolzDirektzusageV1Schema.safeParse(raw);
    expect(parsed.success, parsed.error?.message).toBe(true);
    if (parsed.success) {
      expect(parsed.data.scheme.type).toBe("BoLZ");
      expect(parsed.data.scheme.implementation).toBe("Direktzusage");
      expect(parsed.data.eligibility.minAge.value).toBe(21);
    }
  });
});
