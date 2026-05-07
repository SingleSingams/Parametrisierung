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
      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
        gesetzt
      </span>
    );
  }
  if (status === "missing") {
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
        fehlt
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-950 dark:bg-sky-950/50 dark:text-sky-100">
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
          Parameter für System & Berechnungslogik
        </p>
        <p className="mt-2 leading-relaxed">
          Das ist eine <strong>Implementierungs-Checkliste</strong>: eine Zeile pro
          Kennzahl, die Sie in Ihrer Software pflegen müssen, um Beiträge und Leistungen
          rechnerisch abzubilden. Spalte <strong>System-Schlüssel</strong> können Sie
          1:1 als Feldnamen / Konfigurationsschlüssel verwenden.
        </p>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          Kurzüberblick:{" "}
          <span className="font-semibold text-amber-800 dark:text-amber-200">
            {missingCount} fehlen
          </span>
          {", "}
          <span className="font-semibold text-sky-800 dark:text-sky-200">
            {reviewCount} zur fachlichen Prüfung
          </span>
          {", "}
          <span className="font-semibold text-emerald-800 dark:text-emerald-200">
            {rows.length - missingCount - reviewCount} gesetzt
          </span>
          .
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Kategorie</th>
              <th className="px-3 py-2.5">System-Schlüssel</th>
              <th className="px-3 py-2.5">Parameter</th>
              <th className="px-3 py-2.5">Zweck (Motorik)</th>
              <th className="px-3 py-2.5">Wert aus VO</th>
              <th className="px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.systemKey}
                className={`border-b border-zinc-100 last:border-0 dark:border-zinc-800/80 ${
                  r.status === "missing"
                    ? "bg-amber-50/50 dark:bg-amber-950/15"
                    : r.status === "review"
                      ? "bg-sky-50/40 dark:bg-sky-950/15"
                      : "odd:bg-white even:bg-zinc-50/40 dark:odd:bg-zinc-950/30 dark:even:bg-zinc-900/25"
                }`}
              >
                <td className="px-3 py-2 tabular-nums text-zinc-500">{i + 1}</td>
                <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                  {r.category}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                  {r.systemKey}
                </td>
                <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                  {r.label}
                </td>
                <td className="max-w-[14rem] px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {r.purpose}
                </td>
                <td className="px-3 py-2 text-right font-medium text-zinc-900 dark:text-zinc-100">
                  {r.valueDisplay}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
