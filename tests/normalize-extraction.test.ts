import { describe, expect, it } from "vitest";

import { normalizeAnthropicBolzJson } from "@/lib/extraction/normalize-extraction-json";
import { voBolzDirektzusageV1Schema } from "@/lib/schema";

describe("normalizeAnthropicBolzJson", () => {
  it("füllt fehlende Unterobjekte so auf, dass Zod besteht", () => {
    const sparse = {
      metadata: { documentName: "x", documentDate: null },
      scheme: { type: "BoLZ", implementation: "Direktzusage", openForNewEntries: true },
      eligibility: {
        minAge: { value: 21, source: { page: "1", para: "§2", quote: "x" } },
        waitingPeriod: null,
        excludedGroups: [],
      },
      contributions: null,
      vesting: null,
      benefits: { oldAge: null, disability: {}, death: null },
      adjustment: null,
      openQuestions: "not-array",
    };

    const normalized = normalizeAnthropicBolzJson(sparse);
    const parsed = voBolzDirektzusageV1Schema.safeParse(normalized);
    expect(parsed.success, parsed.error?.message).toBe(true);
  });
});
