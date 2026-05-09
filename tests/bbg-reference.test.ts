import { describe, expect, it } from "vitest";

import {
  BBG_ANNUAL_YEAR_MAX,
  BBG_ANNUAL_YEAR_MIN,
  getBbgRentenversicherungAnnualEur,
} from "@/lib/reference-data/bbg-service";

describe("BBG Referenzdaten (SGB VI Anlage 2 / 2a)", () => {
  it("deckt 1990–2026 ab", () => {
    expect(BBG_ANNUAL_YEAR_MIN).toBe(1990);
    expect(BBG_ANNUAL_YEAR_MAX).toBe(2026);
  });

  it("liefert erwartete Eckwerte", () => {
    expect(getBbgRentenversicherungAnnualEur(2010, "west")).toBe(66000);
    expect(getBbgRentenversicherungAnnualEur(2010, "east")).toBe(55800);
    expect(getBbgRentenversicherungAnnualEur(2024, "west")).toBe(90600);
    expect(getBbgRentenversicherungAnnualEur(2024, "east")).toBe(89400);
  });

  it("stellt ab 2025 keine niedrigere Ost-BBG mehr dar (einheitliches Bundesgebiet)", () => {
    const w = getBbgRentenversicherungAnnualEur(2025, "west");
    const e = getBbgRentenversicherungAnnualEur(2025, "east");
    expect(w).toBe(96600);
    expect(e).toBe(w);
  });
});
