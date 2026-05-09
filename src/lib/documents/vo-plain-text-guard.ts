/** Mindestlänge nach Trim — darunter ist echte VO-Analyse i.d.R. nicht verlässlich möglich. */
export const MIN_VO_PLAIN_TEXT_CHARS = 280;

/**
 * @returns Fehlermeldung für den API-Client, oder `null` wenn genug Text vorliegt.
 */
export function getVoPlainTextValidationMessage(plainText: string): string | null {
  const n = plainText.trim().length;
  if (n >= MIN_VO_PLAIN_TEXT_CHARS) return null;
  return (
    `Zu wenig Klartext aus dem Dokument (${n} Zeichen, mindestens ${MIN_VO_PLAIN_TEXT_CHARS} nötig). ` +
    `Häufig: gescanntes PDF ohne durchsuchbaren Textlayer (kein OCR), geschütztes PDF, oder ein Extraktionsfehler. ` +
    `Bitte ein PDF mit Textlayer, DOCX oder eine .txt mit dem VO-Volltext verwenden. ` +
    `Zum Prüfen: \`npm run extract -- ihre-datei.pdf --dry-run\` zeigt den extrahierten Klartext.`
  );
}
