"use client";

import { useEffect, useState } from "react";

import { CalculationWorkbench } from "@/components/calculation-workbench";
import {
  ExtractionParameterGroups,
  ExtractionRawJsonPanel,
  VoBriefSummary,
} from "@/components/extraction-summary";
import type { VoBolzDirektzusageV1 } from "@/lib/schema";

type ResultTab = "brief" | "params" | "calc";

const tabs: { id: ResultTab; label: string; hint: string }[] = [
  { id: "brief", label: "Kurzfassung", hint: "Was die VO in Kürze bedeutet" },
  { id: "params", label: "Parameter", hint: "Nach Themen gruppiert, mit Quellen" },
  { id: "calc", label: "Rechner", hint: "Beispiele mit Ihren Zahlen" },
];

type Props = {
  data: VoBolzDirektzusageV1;
  rawJson: string;
};

export function ResultsWorkspace({ data, rawJson }: Props) {
  const [tab, setTab] = useState<ResultTab>("brief");

  useEffect(() => {
    setTab("brief");
  }, [data]);

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg shadow-zinc-200/40 ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:ring-zinc-800/80">
      <div className="border-b border-zinc-100 bg-gradient-to-br from-zinc-50 via-white to-indigo-50/40 px-5 py-5 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Analyseergebnis
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Ihre Versorgungsordnung — verständlich aufbereitet
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Wechseln Sie über das Menü zwischen Kurzfassung, detaillierten Parametern
              und dem Rechner. Alle Angaben stammen aus der KI-Lesart — bitte mit dem
              Original abgleichen.
            </p>
          </div>
        </div>

        <div
          className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Ergebnisbereiche"
        >
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                title={t.hint}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${
                  active
                    ? "bg-zinc-900 text-white shadow-md dark:bg-indigo-500 dark:text-white"
                    : "bg-white/80 text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800/80 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6">
        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="min-h-[12rem]"
        >
          {tab === "brief" ? <VoBriefSummary data={data} /> : null}
          {tab === "params" ? (
            <div className="space-y-6">
              <ExtractionParameterGroups data={data} />
              <ExtractionRawJsonPanel rawJson={rawJson} />
            </div>
          ) : null}
          {tab === "calc" ? <CalculationWorkbench extraction={data} /> : null}
        </div>
      </div>
    </section>
  );
}
