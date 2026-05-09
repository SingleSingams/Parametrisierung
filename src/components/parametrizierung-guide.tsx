"use client";

type Props = {
  quoteGrounding?: string | null | undefined;
};

/**
 * Kurzer didaktischer Block: Nutzen der Auswertung, roter Faden der Tabs, Mini-Beispiel.
 */
export function ParametrizierungGuide({ quoteGrounding }: Props) {
  const showQualityHint =
    quoteGrounding === "weak" || quoteGrounding === "skipped";

  return (
    <div className="border-b border-indigo-100 bg-gradient-to-b from-indigo-50/90 to-white px-4 py-4 text-sm text-zinc-800 dark:border-indigo-900/30 dark:from-indigo-950/40 dark:to-zinc-950 md:px-6">
      <h3 className="text-base font-semibold text-indigo-950 dark:text-indigo-100">
        Wozu Ihnen diese Parametrisierung dient
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
        Der Assistent ist ein <strong>Übersetzer</strong> von Ihrem PDF in eine{" "}
        <strong>feste Datenstruktur</strong> (BoLZ Direktzusage). Ziel ist nicht ein Gutachten,
        sondern eine <strong>Checkliste</strong>: Welche Zahlen und Regeln müssen später in
        Software, Schnittstellen oder Tarifen gepflegt werden — mit Quelle im Dokument, wo die
        KI sie findet.
      </p>

      {showQualityHint ? (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
            quoteGrounding === "weak"
              ? "border-amber-300 bg-amber-50/90 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
              : "border-zinc-200 bg-zinc-100/80 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300"
          }`}
        >
          {quoteGrounding === "weak" ? (
            <>
              <strong>Qualitätshinweis:</strong> Automatisch erkannt, dass viele Zitate nicht in
              der Textkopie aus dem PDF wiederzufinden sind — die Ausgabe kann trotz sichtbarer
              Einzelzitate fachlich danebenliegen (z. B. Kapitalplan statt klassischer VO). Nutzen
              Sie die Bereiche unten nur als <strong>Arbeitsentwurf</strong>, bis Sie alles gegen
              das Original geprüft haben.
            </>
          ) : (
            <>
              <strong>Hinweis:</strong> Aus dem PDF ließ sich wenig Klartext extrahieren; eine
              automatische Zitatprüfung war nicht möglich. Ergebnis besonders kritisch lesen.
            </>
          )}
        </div>
      ) : null}

      <h4 className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-800/80 dark:text-indigo-300">
        Roter Faden der vier Bereiche
      </h4>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
        <li>
          <strong>Kurzfassung</strong> — in wenigen Sätzen: Was die KI aus dem Dokument liest
          (Rahmen, Beitrag, Leistungen). Schneller Realitätscheck, ob überhaupt die richtige Art
          Dokument erkannt wurde.
        </li>
        <li>
          <strong>VO-Parameter</strong> — die eigentliche Zerlegung: Gruppen, Tabellen,{" "}
          <strong>Zitate</strong> und Paragraphen. Hier prüfen Sie, ob Zahlen und Formulierungen
          wirklich aus <em>Ihrer</em> Datei stammen.
        </li>
        <li>
          <strong>System & Berechnung</strong> — dieselben Inhalte als{" "}
          <strong>Kurzcodes</strong> (z. B. <code className="rounded bg-white px-1 font-mono dark:bg-zinc-800">BG_AG_SATZ</code>
          ): so etwas tragen Entwickler oder Konfiguratoren in Stammdaten ein. Status „fehlt“ =
          im Dokument nicht gefunden oder unklar.
        </li>
        <li>
          <strong>Berechnungsbereich</strong> — grobe <strong>Spielrechnung</strong> mit den
          erkannten Sätzen und Ihren Bruttolöhnen: nur zum Verständnis der Größenordnung, keine
          rechtsverbindliche Bewertung.
        </li>
      </ol>

      <details className="mt-4 rounded-lg border border-indigo-100 bg-white/80 p-3 dark:border-indigo-900/40 dark:bg-zinc-900/50">
        <summary className="cursor-pointer text-xs font-semibold text-indigo-900 dark:text-indigo-200">
          Mini-Beispiel (nur zur Einordnung, fiktiv)
        </summary>
        <div className="mt-2 space-y-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          <p>
            <strong>1.</strong> In der VO steht: „Der Arbeitgeber zahlt 3 % des beitragspflichtigen
            Bruttojahresgehalts bis zur BBG West.“
          </p>
          <p>
            <strong>2.</strong> Unter VO-Parameter sehen Sie dazu Satz, Zitat und Seite; unter
            System steht derselbe Sachverhalt als Code{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono dark:bg-zinc-800">BG_AG_SATZ</code>{" "}
            mit Wert <strong>3&nbsp;%</strong> und Status „gesetzt“.
          </p>
          <p>
            <strong>3.</strong> Im Rechner tragen Sie Bruttolöhne ein — der nutzt den Satz 0,03,
            um ein grobes Anspar-Kapital zu zeigen. So sehen Sie den Zusammenhang zwischen Text,
            Stammdatum und Formel.
          </p>
        </div>
      </details>

      <p className="mt-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
        Ist Ihr Dokument z. B. ein <strong>Kapitalplan</strong> statt eines klassischen
        VO-Reglements, passt das starre Schema nur bedingt — dann erwarten Sie viele leere Felder
        oder offene Punkte; das ist dann ein Hinweis, das Schema oder den Prozess anzupassen, kein
        Mangel Ihrer Datei.
      </p>
    </div>
  );
}
