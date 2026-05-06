import { NextResponse } from "next/server";

import { detectDocumentKind, extractPlainText } from "@/lib/documents/extract-text";
import { extractVoParams } from "@/lib/extraction/extract-vo-params";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Feld 'file' erwartet (multipart/form-data)." },
        { status: 400 },
      );
    }

    const kind = detectDocumentKind(file.name);
    if (!kind) {
      return NextResponse.json(
        { error: "Nur PDF, DOCX und TXT werden unterstützt." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await extractPlainText(buffer, kind);

    const result = await extractVoParams({
      documentText: text,
      documentName: file.name,
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
