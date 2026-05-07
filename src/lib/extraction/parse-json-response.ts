import { jsonrepair } from "jsonrepair";

function stripBom(s: string): string {
  if (s.length > 0 && s.charCodeAt(0) === 0xfeff) return s.slice(1);
  return s;
}

/** Entfernt führende YAML-ähnliche `---`-Zeilen (Modell spiegelt Nutzer-Prompt). */
function stripLeadingDashBlocks(s: string): string {
  const lines = s.split(/\r?\n/);
  while (lines.length > 0 && /^\s*---\s*$/.test(lines[0] ?? "")) {
    lines.shift();
  }
  return lines.join("\n").trim();
}

/** Erster ``` bzw. ```json-Block im Text (nicht nur Volltext-Umschließung). */
function extractFirstJsonFence(s: string): string | null {
  const m = /```(?:json)?\s*\n?([\s\S]*?)\r?\n?```/i.exec(s);
  const inner = m?.[1];
  return inner != null ? inner.trim() : null;
}

/**
 * Größtes ausgewogenes `{ … }`-Objekt ab erstem `{` (String- und Escape-sicher).
 * Hilft, wenn vor/nach dem JSON noch Fließtext steht.
 */
function extractBalancedJsonObject(source: string): string | null {
  const start = source.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  let quote: '"' | "'" | null = null;

  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === quote) {
        inString = false;
        quote = null;
        continue;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

function normalizeSmartQuotes(s: string): string {
  return s
    .replace(/\u201c|\u201d|\u201e|\u00ab|\u00bb/g, '"')
    .replace(/\u2018|\u2019/g, "'");
}

/**
 * Entfernt ggf. Markdown und Randtext und parst JSON aus Modellantworten.
 * Fallback: `jsonrepair` (häufige KI-Fehler wie trailing commas).
 */
export function parseJsonFromModelText(text: string): unknown {
  let s = stripBom(text.trim());
  s = stripLeadingDashBlocks(s);

  const candidates: string[] = [];

  const fenced = extractFirstJsonFence(s);
  if (fenced) {
    candidates.push(fenced);
    const balF = extractBalancedJsonObject(fenced);
    if (balF) candidates.push(balF);
  }

  const onlyFence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i.exec(s);
  if (onlyFence?.[1]) candidates.push(onlyFence[1].trim());

  const balanced = extractBalancedJsonObject(s);
  if (balanced) candidates.push(balanced);

  candidates.push(s);

  const seen = new Set<string>();
  for (let raw of candidates) {
    raw = normalizeSmartQuotes(raw.trim());
    if (!raw || seen.has(raw)) continue;
    seen.add(raw);

    try {
      return JSON.parse(raw) as unknown;
    } catch {
      /* nächster Kandidat */
    }
    try {
      return JSON.parse(jsonrepair(raw)) as unknown;
    } catch {
      /* nächster Kandidat */
    }
  }

  throw new SyntaxError("Kein gültiges JSON-Objekt in der Modellantwort gefunden.");
}
