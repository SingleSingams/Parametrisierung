/**
 * Legt pdf.js-Worker unter public/vendor ab, damit er auf Vercel (Lambda) immer
 * unter process.cwd()/public/... liegt — unabhängig von node_modules-File-Tracing.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

try {
  const require = createRequire(import.meta.url);
  const src = require.resolve("pdfjs-dist/legacy/build/pdf.worker.min.mjs");
  const destDir = join(root, "public", "vendor", "pdfjs");
  mkdirSync(destDir, { recursive: true });
  const dest = join(destDir, "pdf.worker.mjs");
  copyFileSync(src, dest);
  process.stdout.write(`copy-pdfjs-worker: ${dest}\n`);
} catch (e) {
  process.stderr.write(
    `copy-pdfjs-worker: übersprungen (${e instanceof Error ? e.message : String(e)})\n`,
  );
}
