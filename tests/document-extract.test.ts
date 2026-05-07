import { describe, expect, it } from "vitest";

import { detectDocumentKind, extractPlainText } from "@/lib/documents/extract-text";

describe("Klartext aus Dokumenten", () => {
  it("erkennt TXT und liest UTF-8", async () => {
    expect(detectDocumentKind("vo.txt")).toBe("txt");
    const buf = Buffer.from("  Hallo äöü  ", "utf8");
    expect(await extractPlainText(buf, "txt")).toBe("Hallo äöü");
  });

  it("setzt pdf.js workerSrc (Datei oder CDN)", async () => {
    const { preparePdfJsServerEnvironment } =
      await import("@/lib/documents/pdf-node-canvas-globals");
    await preparePdfJsServerEnvironment();
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    expect(pdfjs.GlobalWorkerOptions.workerSrc).toMatch(/^(file:|https:)/);
  });
});
