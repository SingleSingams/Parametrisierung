import { describe, expect, it } from "vitest";

import {
  getVoPlainTextValidationMessage,
  MIN_VO_PLAIN_TEXT_CHARS,
} from "@/lib/documents/vo-plain-text-guard";

describe("getVoPlainTextValidationMessage", () => {
  it("akzeptiert Text ab Mindestlänge", () => {
    expect(getVoPlainTextValidationMessage("x".repeat(MIN_VO_PLAIN_TEXT_CHARS))).toBeNull();
    expect(getVoPlainTextValidationMessage(`  ${"y".repeat(MIN_VO_PLAIN_TEXT_CHARS)}  `)).toBeNull();
  });

  it("lehnt zu kurzen Text ab", () => {
    const msg = getVoPlainTextValidationMessage("kurz");
    expect(msg).toContain("Zu wenig Klartext");
    expect(msg).toContain("4 Zeichen");
  });
});
