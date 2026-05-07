/**
 * pdf.js (über pdf-parse) erwartet Browser-Globals wie `DOMMatrix`. In Node/Vercel
 * fehlen die — dann z. B. „DOMMatrix is not defined“ bei manchen PDFs (z. B. mit
 * transformierten Pfaden). pdf-parse/worker macht dasselbe; hier nur die leichten
 * Polyfills ohne den großen Worker-Bundle zu laden.
 */
let installed = false;

export async function ensurePdfJsNodeCanvasGlobals(): Promise<void> {
  if (installed) return;
  if (typeof globalThis.DOMMatrix !== "undefined") {
    installed = true;
    return;
  }

  const { DOMMatrix, Path2D, ImageData } = await import("@napi-rs/canvas");
  Object.assign(globalThis, { DOMMatrix, Path2D, ImageData });
  installed = true;
}
