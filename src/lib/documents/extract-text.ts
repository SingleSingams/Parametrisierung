export type DocumentKind = "pdf" | "docx" | "txt";

export function detectDocumentKind(filename: string): DocumentKind | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".txt")) return "txt";
  return null;
}

export async function extractTextFromTxt(buffer: Buffer): Promise<string> {
  return buffer.toString("utf8").trim();
}

/** Dynamischer Import: vermeidet Lade-/Native-Probleme bei reinem TXT-Upload auf Vercel. */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { preparePdfJsServerEnvironment } =
    await import("@/lib/documents/pdf-node-canvas-globals");
  await preparePdfJsServerEnvironment();

  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text?.trim() ?? "";
  } finally {
    await parser.destroy();
  }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value?.trim() ?? "";
}

export async function extractPlainText(
  buffer: Buffer,
  kind: DocumentKind,
): Promise<string> {
  if (kind === "pdf") return extractTextFromPdf(buffer);
  if (kind === "txt") return extractTextFromTxt(buffer);
  return extractTextFromDocx(buffer);
}
