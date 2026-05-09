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

  it("akzeptiert adjustment.method als Zahl (String-Coercion im Schema)", () => {
    const raw = {
      metadata: { documentName: "x", documentDate: null },
      scheme: {
        type: "BoLZ",
        implementation: "Direktzusage",
        openForNewEntries: null,
        closingDate: null,
      },
      eligibility: {
        minAge: { value: null, source: { page: null, para: null, quote: null } },
        waitingPeriod: {
          months: null,
          source: { page: null, para: null, quote: null },
        },
        excludedGroups: [],
      },
      contributions: {
        employerContribution: {
          type: null,
          rate: null,
          base: null,
          salaryDefinition: null,
          salaryCap: null,
          source: { page: null, para: null, quote: null },
        },
        employeeContribution: {
          type: null,
          maxRate: null,
          source: { page: null, para: null, quote: null },
        },
      },
      vesting: {
        rule: null,
        minServiceYears: null,
        minAge: null,
        source: { page: null, para: null, quote: null },
      },
      benefits: {
        oldAge: {
          regularRetirementAge: null,
          earlyRetirementReductionPerMonth: null,
          formula: null,
          guaranteedInterest: null,
          source: { page: null, para: null, quote: null },
        },
        disability: {
          qualifying: null,
          formula: null,
          source: { page: null, para: null, quote: null },
        },
        death: {
          spouse: {
            rate: null,
            remarriage: null,
            source: { page: null, para: null, quote: null },
          },
          orphan: {
            halfOrphan: null,
            fullOrphan: null,
            maxAge: null,
            source: { page: null, para: null, quote: null },
          },
        },
      },
      adjustment: {
        rule: "BetrAVG_§16",
        method: 3,
        source: { page: 1, para: "§8", quote: "Dreifachoption" },
      },
      openQuestions: [],
    };
    const parsed = voBolzDirektzusageV1Schema.safeParse(raw);
    expect(parsed.success, parsed.error?.message).toBe(true);
    if (parsed.success) {
      expect(parsed.data.adjustment.method).toBe("3");
    }
  });
});
