"use client";

import { useState } from "react";

import { ResultsWorkspace } from "@/components/results-workspace";
import { voBolzDirektzusageV1Schema, type VoBolzDirektzusageV1 } from "@/lib/schema";

function isAllowedDocumentFile(name: string): boolean {
  return /\.(pdf|docx|txt)$/i.test(name);
}

/** Browser bricht Verbindung oft ohne HTTP-Status ab (Vercel Timeout, OOM, Netz). */
function describeFetchFailure(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Netzwerkfehler.";
  }
  const m = err.message;
  const looksLikeTransport =
    m === "Failed to fetch" ||
    m.includes("Load failed") ||
    m.includes("NetworkError") ||
    m.includes("network error") ||
    m.includes("aborted");

  if (looksLikeTransport) {
    return [
      "Die Verbindung zum Server ist abgebrochen (im Browser oft „Failed to fetch“).",
      "",
      "Typische Ursachen:",
      "• Vercel Hobby: Serverless-Funktionen enden oft nach ~10 s — KI-Extraktion braucht meist länger. Lösung: Vercel-Plan mit längerem Timeout (z. B. Pro) oder lokal: npm run extract",
      "• Sehr große PDF: Speicher/Timeout — ggf. als .txt exportieren und Text hochladen",
      "• Mobilfunk: kurz WLAN testen oder Seite neu laden",
    ].join("\n");
  }
  return m;
}

export default function Home() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<VoBolzDirektzusageV1 | null>(null);
  const [rawJson, setRawJson] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setExtraction(null);
    setRawJson(null);
    const form = e.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      setError("Bitte eine Datei wählen.");
      return;
    }
    if (!isAllowedDocumentFile(file.name)) {
      setError("Nur PDF-, DOCX- oder TXT-Dateien sind erlaubt.");
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const apiUrl = new URL("/api/extract", window.location.href).toString();
      const res = await fetch(apiUrl, {
        method: "POST",
        body,
        cache: "no-store",
        credentials: "same-origin",
      });
      const raw = await res.text();

      let data: unknown;
      try {
        data = JSON.parse(raw) as unknown;
      } catch {
        const hint =
          raw.trimStart().startsWith("<!") || raw.trimStart().startsWith("<html")
            ? " Der Server hat HTML statt JSON geliefert — typisch bei Vercel-Zeitlimit (Hobby oft ~10 s, KI braucht länger), einer Fehlerseite oder einem falschen Pfad."
            : "";
        setError(
          `Antwort war kein JSON (HTTP ${res.status}).${hint}\n\nAnfang der Antwort:\n${raw.slice(0, 500)}`,
        );
        return;
      }

      if (!res.ok) {
        const errObj = data as { error?: string };
        setError(
          typeof errObj.error === "string"
            ? errObj.error
            : `Anfrage fehlgeschlagen (HTTP ${res.status}).`,
        );
        return;
      }

      const parsed = voBolzDirektzusageV1Schema.safeParse(data);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .slice(0, 15)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("\n");
        setError(`Struktur der Antwort unerwartet:\n${issues}`);
        return;
      }

      setExtraction(parsed.data);
      setRawJson(JSON.stringify(parsed.data, null, 2));
    } catch (err) {
      setError(describeFetchFailure(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Proof of Concept
            </p>
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50 sm:text-base">
              bAV-Parametrisierungs-Assistent
            </p>
          </div>
          <nav
            className="flex shrink-0 items-center gap-3 text-sm font-medium"
            aria-label="Kurznavigation"
          >
            <a
              href="#vo-upload"
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Dokument
            </a>
            <a
              href="/demo-vo.txt"
              download
              className="rounded-full bg-zinc-900 px-3 py-1.5 text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Demo-VO
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Proof of Concept · Version 0.1
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            bAV-Parametrisierungs-Assistent
          </h1>
          <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Versorgungsordnung hochladen (PDF, DOCX oder TXT). Anschließend steuern Sie
            per <strong>Seitenmenü</strong> zwischen <strong>Kurzfassung</strong>, der{" "}
            <strong>Parameterliste nach Typ</strong> (Tabellen + Quellen) und dem{" "}
            <strong>eigenen Berechnungsbereich</strong>. Ohne eigene VO:{" "}
            <a
              href="/demo-vo.txt"
              download
              className="font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
            >
              Demo-VO als Text herunterladen
            </a>{" "}
            und wieder hochladen.
          </p>
        </header>

        <section
          id="vo-upload"
          className="scroll-mt-24 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Dokument
              <input
                name="file"
                type="file"
                className="text-sm font-normal file:mr-4 file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:file:bg-zinc-100 dark:file:text-zinc-900"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {busy ? "Analyse läuft…" : "Extraktion starten"}
            </button>
          </form>
          <p className="text-xs leading-relaxed text-zinc-500">
            Tipp (Android): Wenn{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] dark:bg-zinc-800">
              .txt
            </code>{" "}
            ausgegraut ist, im Dateidialog oft <strong>„Alle Dateien“</strong> wählen.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            <strong>Vercel / Mobil:</strong> Wenn die Analyse sehr lange dauert oder
            große PDFs nutzt, kann die Verbindung abbrechen („Failed to fetch“). Auf
            Vercel Hobby sind Funktionen oft auf ~10 s begrenzt — für echte VOs eher{" "}
            <strong>Pro</strong> oder Extraktion lokal mit{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] dark:bg-zinc-800">
              npm run extract
            </code>
            .
          </p>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Beratungs-Hilfsmittel ohne versicherungsmathematische Endprüfung. API-Key
            und Modell siehe{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] dark:bg-zinc-800">
              .env.example
            </code>
            .
          </p>
        </section>

        {error ? (
          <div
            className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {extraction && rawJson ? (
          <ResultsWorkspace data={extraction} rawJson={rawJson} />
        ) : (
          <aside className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-5 py-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              Noch kein Ergebnis
            </p>
            <p className="mt-2">
              Nach erfolgreicher Extraktion erscheint hier die Auswertung mit{" "}
              <strong>festem Seitenmenü</strong> (Kurzfassung, Parameterliste,
              Berechnungsbereich).
            </p>
          </aside>
        )}
      </main>
    </div>
  );
}
