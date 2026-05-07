import { describe, expect, it } from "vitest";

import { parseJsonFromModelText } from "@/lib/extraction/parse-json-response";

describe("parseJsonFromModelText", () => {
  it("parst nacktes JSON", () => {
    const v = parseJsonFromModelText(`  {"a":1}  `);
    expect(v).toEqual({ a: 1 });
  });

  it("entfernt Markdown-Fence", () => {
    const v = parseJsonFromModelText('```json\n{"x":2}\n```');
    expect(v).toEqual({ x: 2 });
  });

  it("findet JSON in Text und Fence mit --- davor", () => {
    const v = parseJsonFromModelText(
      '---\nHier das Ergebnis:\n```json\n{"y":3,}\n```\nDanke.',
    );
    expect(v).toEqual({ y: 3 });
  });

  it("extrahiert Objekt aus Fließtext", () => {
    const v = parseJsonFromModelText(
      `Einleitung\n\n{"z":4,"nested":{"a":true}}\n\nEnde`,
    );
    expect(v).toEqual({ z: 4, nested: { a: true } });
  });
});
