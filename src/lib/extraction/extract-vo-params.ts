import { createHash } from "node:crypto";

import Anthropic, { APIError, toFile } from "@anthropic-ai/sdk";
import type { ContentBlockParam } from "@anthropic-ai/sdk/resources/messages";
import { voBolzDirektzusageV1Schema, type VoBolzDirektzusageV1 } from "@/lib/schema";
import { EXTRACTION_SYSTEM_PROMPT } from "./system-prompt";
import { normalizeAnthropicBolzJson } from "./normalize-extraction-json";
import { parseJsonFromModelText } from "./parse-json-response";
import { assessQuoteGroundingInPlainText } from "./quote-grounding";

/** Aktuelles Standardmodell (siehe Anthropic-Modellliste); ältere IDs liefern oft 404. */
const DEFAULT_MODEL = "claude-sonnet-4-6";

const FILES_BETA = "files-api-2025-04-14" as const;

/**
 * Ab dieser Roh-PDF-Größe wird Base64 in einer Messages-JSON-Anfrage zu groß / speicherintensiv;
 * stattdessen Anthropic Files API (Upload → file_id), um Abbrüche („Failed to fetch“) zu reduzieren.
 */
const PDF_BYTES_USE_FILES_API = 1_400_000;

export type ExtractVoParamsInput = {
  documentText: string;
  documentName: string;
  model?: string;
  /** Wenn gesetzt: PDF wird von Claude direkt gelesen (Messages API „document“), nicht nur Klartext. */
  pdfBytes?: Buffer;
};

function buildTextOnlyUserPrompt(input: ExtractVoParamsInput): string {
  return `Dokumentname: ${input.documentName}

Nachfolgend der Klartext der Versorgungsordnung (ggf. mehrere Teile hintereinander):

---
${input.documentText}
---

Extrahiere die Parametrisierung gemäß Schema BoLZ_Direktzusage_v1 als JSON.
Liegt kein klassisches BoLZ-Direktzusage-Reglement vor, setze Fachfelder überwiegend null
und erkläre in openQuestions den erkannten Dokumenttyp — keine Standard-bAV-Musterwerte.`;
}

function buildPdfUserPrompt(input: ExtractVoParamsInput): string {
  const trimmed = input.documentText.trim();
  const appendix =
    trimmed.length > 0
      ? `\nZusätzlich (evtl. unvollständig) per Textextraktion aus dem PDF — die PDF-Seiten haben Vorrang:\n\n---\n${trimmed}\n---\n`
      : "";
  return `Dokumentname: ${input.documentName}

Die Versorgungsordnung liegt als **vollständiges PDF** im ersten Inhaltsblock (document) vor.
${appendix}
Extrahiere die Parametrisierung gemäß Schema BoLZ_Direktzusage_v1 als JSON.
Nutze für source.page wo möglich die **PDF-Seitennummer** (wie im Viewer angezeigt).

Wichtig: Wenn das PDF **kein** klassisches BoLZ-Direktzusage-Reglement ist (z. B. Kapitalplan,
Deckungskonzept, Marketing), dann **keine** typischen bAV-Standardwerte einsetzen — Felder
null lassen und in openQuestions den Dokumenttyp benennen. Jede Zahl nur mit Beleg im PDF.`;
}

type MessageLike = { content: Array<{ type: string; text?: string }> };

function firstTextFromMessage(message: MessageLike): string {
  const block = message.content.find((b) => b.type === "text");
  if (!block || typeof block.text !== "string") {
    throw new Error("Anthropic-Antwort enthielt keinen Textblock.");
  }
  return block.text;
}

async function runAnthropicExtraction(
  client: Anthropic,
  model: string,
  input: ExtractVoParamsInput,
  useNativePdf: boolean,
): Promise<{ message: MessageLike; pdfTransport: "none" | "base64" | "files_api" }> {
  if (!useNativePdf) {
    const message = await client.messages.create({
      model,
      max_tokens: 16_384,
      temperature: 0,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildTextOnlyUserPrompt(input) }],
    });
    return { message, pdfTransport: "none" };
  }

  const pdf = input.pdfBytes!;

  if (pdf.length >= PDF_BYTES_USE_FILES_API) {
    const uploadable = await toFile(pdf, input.documentName, { type: "application/pdf" });
    const uploaded = await client.beta.files.upload({
      file: uploadable,
      betas: [FILES_BETA],
    });
    try {
      const message = await client.beta.messages.create({
        model,
        max_tokens: 16_384,
        temperature: 0,
        betas: [FILES_BETA],
        system: EXTRACTION_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                title: input.documentName,
                source: { type: "file", file_id: uploaded.id },
              },
              { type: "text", text: buildPdfUserPrompt(input) },
            ],
          },
        ],
      });
      return { message, pdfTransport: "files_api" };
    } finally {
      await client.beta.files.delete(uploaded.id, { betas: [FILES_BETA] }).catch(() => undefined);
    }
  }

  const userContent: ContentBlockParam[] = [
    {
      type: "document",
      title: input.documentName,
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: pdf.toString("base64"),
      },
    },
    { type: "text", text: buildPdfUserPrompt(input) },
  ];

  const message = await client.messages.create({
    model,
    max_tokens: 16_384,
    temperature: 0,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });
  return { message, pdfTransport: "base64" };
}

export async function extractVoParams(
  input: ExtractVoParamsInput,
): Promise<VoBolzDirektzusageV1> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY ist nicht gesetzt. Bitte .env anlegen (siehe .env.example).",
    );
  }

  const model = input.model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  const client = new Anthropic({ apiKey });

  const useNativePdf = Boolean(input.pdfBytes && input.pdfBytes.length > 0);

  let message: MessageLike;
  let pdfTransport: "none" | "base64" | "files_api" = "none";
  try {
    const out = await runAnthropicExtraction(client, model, input, useNativePdf);
    message = out.message;
    pdfTransport = out.pdfTransport;
  } catch (e) {
    if (e instanceof APIError && e.status === 404) {
      throw new Error(
        `Anthropic-Modell "${model}" wurde nicht gefunden (404). Lege in Vercel (oder .env) die Variable ANTHROPIC_MODEL auf ein aktuelles Modell, z. B. claude-sonnet-4-6 oder claude-haiku-4-5 — siehe https://docs.anthropic.com/en/docs/about-claude/models`,
      );
    }
    throw e;
  }

  const textBlockText = firstTextFromMessage(message);

  let raw: unknown;
  try {
    raw = parseJsonFromModelText(textBlockText);
  } catch (e) {
    const snippet = textBlockText.slice(0, 800);
    throw new Error(
      `JSON-Parsing fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}\n---\n${snippet}`,
    );
  }

  raw = normalizeAnthropicBolzJson(raw);

  const parsed = voBolzDirektzusageV1Schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 25)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Zod-Validierung fehlgeschlagen:\n${issues}`);
  }

  const now = new Date().toISOString();
  const sourcePlainTextSha256 = createHash("sha256")
    .update(input.documentText, "utf8")
    .digest("hex");
  const sourcePdfSha256 = useNativePdf
    ? createHash("sha256").update(input.pdfBytes!).digest("hex")
    : undefined;

  const grounding = assessQuoteGroundingInPlainText(parsed.data, input.documentText);

  return {
    ...parsed.data,
    metadata: {
      ...parsed.data.metadata,
      documentName: input.documentName,
      extractedAt: now,
      modelVersion: model,
      confidence: parsed.data.metadata.confidence ?? "medium",
      sourcePlainTextLength: input.documentText.length,
      sourcePlainTextSha256,
      documentIngestMode: useNativePdf ? "anthropic_pdf" : "plain_text",
      quoteGrounding: grounding.level,
      ...(useNativePdf ? { pdfTransport } : {}),
      ...(sourcePdfSha256 ? { sourcePdfSha256 } : {}),
    },
  };
}
