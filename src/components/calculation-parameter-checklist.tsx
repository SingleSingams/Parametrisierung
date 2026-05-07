"use client";

import { useMemo } from "react";

import type { VoBolzDirektzusageV1 } from "@/lib/schema";
import {
  buildSystemCalculationParameterRows,
  type SystemCalculationParameterRow,
} from "@/lib/presenters/system-calculation-parameters";

function StatusBadge({ status }: { status: SystemCalculationParameterRow["status"] }) {
  if (status === "ok") {
    return (
      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
        gesetzt
      </span>
    );
  }
  if (status === "missing") {
    return (
      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
        fehlt
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-950 dark:bg-sky-950/50 dark:text-sky-100">
      prüfen
    </span>
  );
}

type Props = {
  data: VoBolzDirektzusageV1;
};

export function CalculationParameterChecklist({ data }: Props) {
  const rows = useMemo(() => buildSystemCalculationParameterRows(data), [data]);
  const missingCount = rows.filter((r) => r.status === "missing").length;
  const reviewCount = rows.filter((r) => r.status === "review").length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          Parameter für System & Berechnung
        </p>
        <p className="mt-2 leading-relaxed">
          Jede Karte ist <strong>eine Kennzahl</strong>, die Sie in Ihrer Software
          hinterlegen. Der <strong>Kurzcode</strong> eignet sich für Konfiguration und
          Abstimmung. Den <strong>technischen JSON-Pfad</strong> klappen Sie bei Bedarf
          auf — ohne horizontales Scrollen.
        </p>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-amber-800 dark:text-amber-200">
            {missingCount} fehlen
          </span>
          {", "}
          <span className="font-semibold text-sky-800 dark:text-sky-200">
            {reviewCount} prüfen
          </span>
          {", "}
          <span className="font-semibold text-emerald-800 dark:text-emerald-200">
            {rows.length - missingCount - reviewCount} gesetzt
          </span>
          .
        </p>
      </div>

      <ul className="space-y-4">
        {rows.map((r, i) => {
          const prev = rows[i - 1];
          const showCatHeader = !prev || prev.category !== r.category;
          return (
            <li key={`${r.schemaPath}-${i}`}>
              {showCatHeader ? (
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  {r.category}
                </p>
              ) : null}
              <article
                className={`rounded-xl border p-4 shadow-sm ${
                  r.status === "missing"
                    ? "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20"
                    : r.status === "review"
                      ? "border-sky-200 bg-sky-50/40 dark:border-sky-900 dark:bg-sky-950/20"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="rounded-md bg-zinc-900 px-2 py-1 font-mono text-[11px] font-bold tracking-wide text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {r.code}
                    </span>
                    <span className="text-xs tabular-nums text-zinc-400">#{i + 1}</span>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <h3 className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {r.label}
                </h3>
                <p className="mt-1 text-xs leading-snug text-zinc-600 dark:text-zinc-400">
                  {r.purpose}
                </p>
                <p className="mt-3 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Wert aus VO:</span>{" "}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {r.valueDisplay}
                  </span>
                </p>
                <details className="mt-3 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                  <summary className="cursor-pointer text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    Technischer Pfad (JSON)
                  </summary>
                  <p className="mt-1 break-all font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                    {r.schemaPath}
                  </p>
                </details>
              </article>
            </li>
          );
        })}
      </ul>

      {data.openQuestions.length ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <h3 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
            Offene Punkte (beeinflussen Parameter)
          </h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-950 dark:text-amber-100">
            {data.openQuestions.map((q, idx) => (
              <li key={idx}>
                <span className="font-medium">{q.topic}</span> — {q.reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
