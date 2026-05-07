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
 * Ausgewogenes `{ … }` ab fester Position (String- und Escape-sicher).
 */
function extractBalancedJsonFrom(source: string, start: number): string | null {
  if (start < 0 || start >= source.length || source[start] !== "{") return null;
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

/** Alle vollständigen JSON-Objekte im Text (längstes zuerst) — z. B. wenn vor dem Haupt-JSON noch ein Fragment steht. */
function listBalancedJsonObjects(source: string): string[] {
  const found = new Set<string>();
  const maxStarts = 80;
  let starts = 0;
  for (let i = 0; i < source.length && starts < maxStarts; i++) {
    if (source[i] !== "{") continue;
    starts++;
    const blob = extractBalancedJsonFrom(source, i);
    if (blob && blob.length > 30) found.add(blob);
  }
  return [...found].sort((a, b) => b.length - a.length);
}

function normalizeSmartQuotes(s: string): string {
  return s
    .replace(/\u201c|\u201d|\u201e|\u00ab|\u00bb/g, '"')
    .replace(/\u2018|\u2019/g, "'");
}

function tryParseJson(raw: string): unknown | null {
  const t = normalizeSmartQuotes(raw.trim());
  if (!t) return null;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    try {
      return JSON.parse(jsonrepair(t)) as unknown;
    } catch {
      return null;
    }
  }
}

function pushUnique(candidates: string[], s: string | null | undefined) {
  if (!s) return;
  const t = s.trim();
  if (!t) return;
  if (!candidates.includes(t)) candidates.push(t);
}

/**
 * Entfernt ggf. Markdown und Randtext und parst JSON aus Modellantworten.
 * Fallback: `jsonrepair` (häufige KI-Fehler wie trailing commas).
 */
export function parseJsonFromModelText(text: string): unknown {
  let s = stripBom(text.trim());
  s = stripLeadingDashBlocks(s);

  const firstBrace = s.indexOf("{");
  if (firstBrace > 0) {
    s = s.slice(firstBrace);
  }

  const candidates: string[] = [];

  pushUnique(candidates, s);
  try {
    const repaired = jsonrepair(s);
    pushUnique(candidates, repaired);
  } catch {
    /* ignorieren */
  }

  const fenced = extractFirstJsonFence(s);
  pushUnique(candidates, fenced);
  if (fenced) {
    pushUnique(candidates, extractBalancedJsonFrom(fenced, 0));
  }

  const onlyFence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i.exec(s);
  pushUnique(candidates, onlyFence?.[1]?.trim() ?? null);

  pushUnique(candidates, extractBalancedJsonFrom(s, 0));

  for (const blob of listBalancedJsonObjects(s)) {
    pushUnique(candidates, blob);
  }

  const deduped = [...new Set(candidates.filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );

  for (const raw of deduped) {
    const parsed = tryParseJson(raw);
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  }

  throw new SyntaxError("Kein gültiges JSON-Objekt in der Modellantwort gefunden.");
}
