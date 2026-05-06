import Anthropic, { APIError } from "@anthropic-ai/sdk";
import { voBolzDirektzusageV1Schema, type VoBolzDirektzusageV1 } from "@/lib/schema";
import { EXTRACTION_SYSTEM_PROMPT } from "./system-prompt";
import { parseJsonFromModelText } from "./parse-json-response";

/** Aktuelles Standardmodell (siehe Anthropic-Modellliste); ältere IDs wie …-20250514 liefern oft 404. */
const DEFAULT_MODEL = "claude-sonnet-4-6";

export type ExtractVoParamsInput = {
  documentText: string;
  documentName: string;
  model?: string;
};

function buildUserPrompt(input: ExtractVoParamsInput): string {
  return `Dokumentname: ${input.documentName}

Nachfolgend der Klartext der Versorgungsordnung (ggf. mehrere Teile hintereinander):

---
${input.documentText}
---

Extrahiere die Parametrisierung gemäß Schema BoLZ_Direktzusage_v1 als JSON.`;
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

  let message;
  try {
    message = await client.messages.create({
      model,
      max_tokens: 16_384,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input) }],
    });
  } catch (e) {
    if (e instanceof APIError && e.status === 404) {
      throw new Error(
        `Anthropic-Modell "${model}" wurde nicht gefunden (404). Lege in Vercel (oder .env) die Variable ANTHROPIC_MODEL auf ein aktuelles Modell, z. B. claude-sonnet-4-6 oder claude-haiku-4-5 — siehe https://docs.anthropic.com/en/docs/about-claude/models`,
      );
    }
    throw e;
  }

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Anthropic-Antwort enthielt keinen Textblock.");
  }

  let raw: unknown;
  try {
    raw = parseJsonFromModelText(textBlock.text);
  } catch (e) {
    const snippet = textBlock.text.slice(0, 800);
    throw new Error(
      `JSON-Parsing fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}\n---\n${snippet}`,
    );
  }

  const parsed = voBolzDirektzusageV1Schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 25)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Zod-Validierung fehlgeschlagen:\n${issues}`);
  }

  const now = new Date().toISOString();
  return {
    ...parsed.data,
    metadata: {
      ...parsed.data.metadata,
      documentName: input.documentName,
      extractedAt: now,
      modelVersion: model,
      confidence: parsed.data.metadata.confidence ?? "medium",
    },
  };
}
