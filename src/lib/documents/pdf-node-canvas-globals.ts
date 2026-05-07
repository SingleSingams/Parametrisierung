/**
 * pdf.js (über pdf-parse) im Node-/Serverless-Umfeld:
 *
 * 1) **Canvas-Globals** (`DOMMatrix`, `Path2D`, `ImageData`) — sonst z. B.
 *    „DOMMatrix is not defined“ bei manchen PDFs.
 * 2) **Worker-URL** — Vercel/Next-File-Tracing packt `pdf.worker.mjs` oft nicht mit;
 *    pdf.js fällt dann auf einen „Fake Worker“ zurück und scheitert mit
 *    „Cannot find module …/pdf.worker.mjs“. Wir setzen `GlobalWorkerOptions.workerSrc`
 *    auf eine existierende `file:`-URL oder (Fallback) dieselbe Version per CDN.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let canvasReady = false;
let workerReady = false;

async function ensureCanvasGlobals(): Promise<void> {
  if (canvasReady) return;
  if (typeof globalThis.DOMMatrix !== "undefined") {
    canvasReady = true;
    return;
  }

  const { DOMMatrix, Path2D, ImageData } = await import("@napi-rs/canvas");
  Object.assign(globalThis, { DOMMatrix, Path2D, ImageData });
  canvasReady = true;
}

function resolveWorkerFileUrl(version: string): string {
  const candidate = join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs",
  );
  if (existsSync(candidate)) {
    return pathToFileURL(candidate).href;
  }
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/legacy/build/pdf.worker.mjs`;
}

/**
 * Muss vor `import("pdf-parse")` / `new PDFParse(...)` laufen (gemeinsames pdf.js-Modul).
 */
export async function preparePdfJsServerEnvironment(): Promise<void> {
  await ensureCanvasGlobals();
  if (workerReady) return;

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { GlobalWorkerOptions, version } = pdfjs;

  GlobalWorkerOptions.workerSrc = resolveWorkerFileUrl(version);
  workerReady = true;
}
