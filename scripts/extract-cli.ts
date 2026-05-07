import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  detectDocumentKind,
  extractPlainText,
} from "../src/lib/documents/extract-text";
import { extractVoParams } from "../src/lib/extraction/extract-vo-params";

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const fileArg = args.find((a) => !a.startsWith("--"));
  let outPath: string | undefined;
  const outIdx = args.indexOf("--out");
  if (outIdx !== -1 && args[outIdx + 1]) outPath = args[outIdx + 1];

  if (!fileArg) {
    console.error(
      "Usage: npm run extract -- <datei.pdf|docx|txt> [--out ergebnis.json] [--dry-run]",
    );
    process.exit(1);
  }

  const abs = path.resolve(fileArg);
  const kind = detectDocumentKind(abs);
  if (!kind) {
    console.error("Nur PDF, DOCX und TXT werden unterstützt.");
    process.exit(1);
  }

  const buffer = readFileSync(abs);
  const text = await extractPlainText(buffer, kind);
  if (!text.length) {
    console.warn(
      "Warnung: Kein Text extrahiert (leeres PDF, Scan ohne OCR, oder Parsing-Problem).",
    );
  }

  if (dryRun) {
    console.log("--- Extrahierter Klartext (Anfang) ---\n");
    console.log(text.slice(0, 12_000));
    process.exit(0);
  }

  const documentName = path.basename(abs);
  const result = await extractVoParams({ documentText: text, documentName });
  const json = JSON.stringify(result, null, 2);
  if (outPath) {
    writeFileSync(path.resolve(outPath), json, "utf8");
    console.error(`Geschrieben: ${path.resolve(outPath)}`);
  } else {
    console.log(json);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
