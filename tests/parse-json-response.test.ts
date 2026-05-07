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

  it("ignoriert langen Fließtext vor dem ersten JSON-Objekt", () => {
    const payload = { metadata: { documentName: "x.pdf" }, k: 1 };
    const wrapped = `Die Analyse ergab folgende Struktur (bitte prüfen):\n\n${JSON.stringify(payload)}`;
    const v = parseJsonFromModelText(wrapped);
    expect(v).toEqual(payload);
  });

  it("wählt das größere Objekt wenn mehrere geschweifte Klammern vorkommen", () => {
    const small = { note: "x" };
    const large = { metadata: { documentName: "a" }, scheme: { type: "BoLZ" } };
    const text = `${JSON.stringify(small)} und dann ${JSON.stringify(large)}`;
    const v = parseJsonFromModelText(text);
    expect(v).toEqual(large);
  });
});
