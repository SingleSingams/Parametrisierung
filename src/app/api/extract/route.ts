import { NextResponse } from "next/server";

import { detectDocumentKind, extractPlainText } from "@/lib/documents/extract-text";
import { extractVoParams } from "@/lib/extraction/extract-vo-params";

export const runtime = "nodejs";
/** Vercel: je nach Plan gedeckelt (Hobby oft ~10 s). Für längere KI-Läufe Pro oder lokales CLI. */
export const maxDuration = 300;

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

    let body: string;
    try {
      body = JSON.stringify(result);
    } catch (serErr) {
      const detail = serErr instanceof Error ? serErr.message : String(serErr);
      return NextResponse.json(
        {
          error: "Extraktionsergebnis ließ sich nicht als JSON serialisieren.",
          detail,
        },
        { status: 500 },
      );
    }

    return new NextResponse(body, {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
