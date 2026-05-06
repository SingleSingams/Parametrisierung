/**
 * Entfernt ggf. Markdown-Codefences um reines JSON aus Modellantworten zu erhalten.
 */
export function parseJsonFromModelText(text: string): unknown {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i.exec(trimmed);
  if (fence?.[1]) {
    return JSON.parse(fence[1].trim()) as unknown;
  }
  return JSON.parse(trimmed) as unknown;
}
