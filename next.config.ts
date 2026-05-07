import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth", "@napi-rs/canvas"],
  /** Vercel: Worker-Dateien ins File-Tracing (zusätzlich zu /tmp-Fallback im Code) */
  outputFileTracingIncludes: {
    "/api/extract": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      "./public/vendor/pdfjs/pdf.worker.mjs",
    ],
  },
};

export default nextConfig;
