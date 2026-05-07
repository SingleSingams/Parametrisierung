/**
 * pdf.js (über pdf-parse) im Node-/Serverless-Umfeld:
 *
 * 1) **Canvas-Globals** (`DOMMatrix`, `Path2D`, `ImageData`)
 * 2) **Worker-URL** für den pdf.js-**Fake-Worker** (Node): `import(workerSrc)` braucht
 *    eine existierende **file:**-URL. Auf Vercel fehlt `pdf.worker.mjs` oft unter
 *    `node_modules` → wir legen eine Kopie per **postinstall** nach `public/vendor/pdfjs/`
 *    und nutzen die zuerst; sonst node_modules, sonst Download nach `/tmp`.
 *
 * `PDFParse.setWorker` stellt sicher, dass pdf-parse dieselbe pdf.js-Instanz nutzt.
 */
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Muss zu `package.json` / `pdfjs-dist` passen (CDN-Fallback). */
const PDFJS_DIST_VERSION = "5.4.296";

let canvasReady = false;
/** Gecachte `file:`-URL zum Worker (lokal oder unter /tmp materialisiert). */
let cachedWorkerHref: string | null = null;

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

async function resolveWorkerFileUrl(): Promise<string> {
  if (cachedWorkerHref) {
    try {
      const p = fileURLToPath(cachedWorkerHref);
      if (existsSync(p)) return cachedWorkerHref;
    } catch {
      /* ungültige URL */
    }
    cachedWorkerHref = null;
  }

  const names = ["pdf.worker.min.mjs", "pdf.worker.mjs"] as const;

  const vendored = join(process.cwd(), "public", "vendor", "pdfjs", "pdf.worker.mjs");
  if (existsSync(vendored)) {
    cachedWorkerHref = pathToFileURL(vendored).href;
    return cachedWorkerHref;
  }

  const localDir = join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build");
  for (const name of names) {
    const p = join(localDir, name);
    if (existsSync(p)) {
      cachedWorkerHref = pathToFileURL(p).href;
      return cachedWorkerHref;
    }
  }

  const cdnBase = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_DIST_VERSION}/legacy/build`;
  for (const name of names) {
    const url = `${cdnBase}/${name}`;
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    const dir = mkdtempSync(join(tmpdir(), "pdfjs-worker-"));
    const dest = join(dir, "pdf.worker.mjs");
    writeFileSync(dest, buf);
    cachedWorkerHref = pathToFileURL(dest).href;
    return cachedWorkerHref;
  }

  throw new Error(
    "pdf.js-Worker konnte nicht bereitgestellt werden (public/vendor, node_modules, CDN).",
  );
}

/**
 * Muss vor `new PDFParse(...)` laufen.
 */
export async function preparePdfJsServerEnvironment(): Promise<void> {
  await ensureCanvasGlobals();

  const workerHref = await resolveWorkerFileUrl();

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = workerHref;

  const { PDFParse } = await import("pdf-parse");
  PDFParse.setWorker(workerHref);
}
