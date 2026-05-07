/**
 * pdf.js (über pdf-parse) im Node-/Serverless-Umfeld:
 *
 * 1) **Canvas-Globals** (`DOMMatrix`, `Path2D`, `ImageData`) — sonst z. B.
 *    „DOMMatrix is not defined“ bei manchen PDFs.
 * 2) **Worker-URL** für den pdf.js-**Fake-Worker** (Node: echte Web Workers gibt es nicht):
 *    pdf.js macht `await import(workerSrc)`. Das darf in Node **kein** `https:`-URL sein
 *    (Standard-ESM-Loader lehnt ab). Wenn die Worker-Datei nicht unter
 *    `cwd/node_modules/...` liegt (Vercel-Layout), laden wir sie per **fetch** von jsDelivr
 *    und legen sie unter **`/tmp`** ab — dann `file:`-URL.
 */
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

let canvasReady = false;
let workerReady = false;
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

async function resolveWorkerFileUrl(version: string): Promise<string> {
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
  const localDir = join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build");

  for (const name of names) {
    const p = join(localDir, name);
    if (existsSync(p)) {
      cachedWorkerHref = pathToFileURL(p).href;
      return cachedWorkerHref;
    }
  }

  const cdnBase = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/legacy/build`;
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
    "pdf.js-Worker konnte weder aus node_modules noch per CDN nach /tmp geladen werden.",
  );
}

/**
 * Muss vor `import("pdf-parse")` / `new PDFParse(...)` laufen (gemeinsames pdf.js-Modul).
 */
export async function preparePdfJsServerEnvironment(): Promise<void> {
  await ensureCanvasGlobals();
  if (workerReady) return;

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { GlobalWorkerOptions, version } = pdfjs;

  GlobalWorkerOptions.workerSrc = await resolveWorkerFileUrl(version);
  workerReady = true;
}
