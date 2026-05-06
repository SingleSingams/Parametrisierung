"use client";

import { useState } from "react";

export default function Home() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [json, setJson] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setJson(null);
    const form = e.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      setError("Bitte eine Datei wählen.");
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Anfrage fehlgeschlagen.",
        );
        return;
      }
      setJson(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Netzwerkfehler.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-14">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Proof of Concept · Version 0.1
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            bAV-Parametrisierungs-Assistent
          </h1>
          <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Upload einer Versorgungsordnung (PDF oder DOCX). Das Backend extrahiert
            strukturierte Parameter für BoLZ Direktzusage inklusive Quellenangaben und
            validiert gegen ein Zod-Schema.
          </p>
        </header>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Dokument
              <input
                name="file"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Beratungs-Hilfsmittel ohne versicherungsmathematische Endprüfung. Nur
            synthetische oder anonymisierte VOs verwenden; API-Key und Modell siehe{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] dark:bg-zinc-800">
              .env.example
            </code>
            . CLI:{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] dark:bg-zinc-800">
              npm run extract -- dokument.pdf
            </code>
          </p>
        </section>

        {error ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {json ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Ergebnis (JSON)</h2>
            <pre className="max-h-[480px] overflow-auto rounded-lg border border-zinc-200 bg-white p-4 text-xs leading-relaxed dark:border-zinc-800 dark:bg-zinc-900">
              {json}
            </pre>
          </section>
        ) : null}
      </main>
    </div>
  );
}
