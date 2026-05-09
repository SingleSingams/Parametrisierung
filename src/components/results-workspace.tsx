"use client";

import { useEffect, useState } from "react";

import { CalculationParameterChecklist } from "@/components/calculation-parameter-checklist";
import { CalculationWorkbench } from "@/components/calculation-workbench";
import {
  ExtractionParameterGroups,
  ExtractionRawJsonPanel,
  VoBriefSummary,
} from "@/components/extraction-summary";
import { ParametrizierungGuide } from "@/components/parametrizierung-guide";
import type { VoBolzDirektzusageV1 } from "@/lib/schema";

type ResultTab = "brief" | "params" | "system" | "calc";

const NAV: {
  id: ResultTab;
  label: string;
  short: string;
  desc: string;
}[] = [
  {
    id: "brief",
    label: "Kurzfassung",
    short: "Kurz",
    desc: "Schnell prüfen: passt die Lesart?",
  },
  {
    id: "params",
    label: "VO-Parameter",
    short: "VO",
    desc: "Detail + Zitate zum Abgleich",
  },
  {
    id: "system",
    label: "System & Berechnung",
    short: "System",
    desc: "Kurzcodes fürs IT-Stammblatt",
  },
  {
    id: "calc",
    label: "Berechnungsbereich",
    short: "Rechner",
    desc: "Spielrechnung mit Ihren Zahlen",
  },
];

const tabHeadline: Record<ResultTab, { title: string; subtitle: string }> = {
  brief: {
    title: "Kurzfassung",
    subtitle:
      "Erste Einordnung: Worum es im Dokument geht — bevor Sie in die Detailparameter gehen.",
  },
  params: {
    title: "VO-Parameter",
    subtitle:
      "Hier vergleichen Sie jeden Wert mit Zitat und Abschnitt im Original. So erkennen Sie Fehlinterpretationen.",
  },
  system: {
    title: "System & Berechnung",
    subtitle:
      "Dieselben Kennzahlen in Kurzform für Konfiguration und Abstimmung mit Entwicklung — inkl. Status, ob etwas fehlt.",
  },
  calc: {
    title: "Berechnungsbereich",
    subtitle:
      "Verknüpfung aus erkannten Sätzen und Ihren Beispiel-Bruttos: grobe Plausibilität, kein Ersatz für eine Tarifprüfung.",
  },
};

type Props = {
  data: VoBolzDirektzusageV1;
  rawJson: string;
};

function IconBrief({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 7h11M9 12h11M9 17h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 7h.01M5 12h.01M5 17h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTable({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5h16v14H4V5zm0 4h16M10 5v14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCalc({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 8h4M14 8h2M8 12h2M12 12h4M8 16h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const tabIcons: Record<ResultTab, typeof IconBrief> = {
  brief: IconBrief,
  params: IconList,
  system: IconTable,
  calc: IconCalc,
};

export function ResultsWorkspace({ data, rawJson }: Props) {
  const [tab, setTab] = useState<ResultTab>("system");

  useEffect(() => {
    setTab("system");
  }, [data]);

  const docTitle = data.metadata.documentName?.trim() || "Extraktion";

  return (
    <section
      className="overflow-hidden rounded-2xl border border-zinc-300/80 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)] dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-none"
      aria-label="Ergebnis der Analyse"
    >
      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/80 md:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          Analyseergebnis
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {docTitle}
        </p>
      </div>

      {data.metadata.quoteGrounding === "weak" ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-50 md:px-6">
          <p className="font-semibold">Hinweis: Inhalt wirkt nicht aus Ihrem Dokument belegt</p>
          <p className="mt-1 text-xs leading-relaxed opacity-95">
            Die gelieferten <strong>source.quote</strong>-Texte finden sich in der automatisch aus
            dem PDF erzeugten Textkopie nicht wieder (oder es fehlen lange Zitate). Typische Ursachen:
            Modell-Füllwerte, ein anderer Dokumenttyp als klassische BoLZ-VO (z. B. Kapitalplan), oder
            starkes Layout ohne brauchbaren Textlayer. Bitte das Ergebnis fachlich prüfen.
          </p>
        </div>
      ) : data.metadata.quoteGrounding === "skipped" ? (
        <div className="border-b border-zinc-200 bg-zinc-100/90 px-4 py-2.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 md:px-6">
          Aus dem PDF ließ sich wenig Klartext extrahieren — eine automatische Zitatprüfung war
          nicht möglich. Das PDF wurde dennoch direkt an das Modell übergeben.
        </div>
      ) : null}

      <ParametrizierungGuide quoteGrounding={data.metadata.quoteGrounding} />

      <div className="flex flex-col md:flex-row md:min-h-[min(70vh,640px)]">
        <nav
          className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-100 md:static md:z-auto md:w-56 md:shrink-0 md:border-b-0 md:border-r md:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/60 lg:w-60"
          aria-label="Hauptmenü"
        >
          <p className="hidden px-4 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 md:block">
            Menü
          </p>
          <ul className="grid grid-cols-2 divide-x divide-y divide-zinc-200 md:flex md:flex-col md:gap-1 md:divide-x-0 md:divide-y-0 md:p-3 dark:divide-zinc-800">
            {NAV.map((item) => {
              const active = tab === item.id;
              const Icon = tabIcons[item.id];
              return (
                <li key={item.id} className="md:list-none">
                  <button
                    type="button"
                    id={`tab-${item.id}`}
                    role="tab"
                    aria-selected={active}
                    aria-controls={`panel-${item.id}`}
                    onClick={() => setTab(item.id)}
                    className={`flex h-full w-full flex-col items-center gap-1 px-2 py-3 text-center transition md:flex-row md:items-start md:gap-3 md:rounded-lg md:px-3 md:py-3 md:text-left ${
                      active
                        ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-white dark:ring-zinc-600"
                        : "bg-transparent text-zinc-600 hover:bg-zinc-50/80 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                    } `}
                  >
                    <Icon className="h-5 w-5 shrink-0 opacity-80 md:mt-0.5" />
                    <span className="text-[11px] font-semibold leading-tight md:hidden">
                      {item.short}
                    </span>
                    <span className="hidden min-w-0 flex-1 md:block">
                      <span className="block text-sm font-semibold leading-snug">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs font-normal leading-snug text-zinc-500 dark:text-zinc-400">
                        {item.desc}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950">
          <header className="border-b border-zinc-100 px-4 py-4 md:px-8 dark:border-zinc-800">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {tabHeadline[tab].title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
              {tabHeadline[tab].subtitle}
            </p>
          </header>

          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            className="flex-1 px-4 py-6 md:px-8 md:py-8"
          >
            {tab === "brief" ? <VoBriefSummary data={data} /> : null}
            {tab === "params" ? (
              <div className="space-y-8">
                <ExtractionParameterGroups data={data} />
                <ExtractionRawJsonPanel rawJson={rawJson} />
              </div>
            ) : null}
            {tab === "system" ? <CalculationParameterChecklist data={data} /> : null}
            {tab === "calc" ? (
              <div
                className="rounded-2xl border-2 border-indigo-300/70 bg-gradient-to-b from-indigo-50/90 via-white to-emerald-50/40 p-4 shadow-inner dark:border-indigo-700/60 dark:from-indigo-950/50 dark:via-zinc-950 dark:to-emerald-950/20 md:p-6"
                aria-label="Berechnungsbereich"
              >
                <div className="mb-5 flex flex-col gap-1 border-b border-indigo-200/60 pb-4 dark:border-indigo-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300">
                    Berechnungslabor
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Eingaben und Ergebnisse sind von der Parameterliste räumlich und
                    farblich getrennt — nur für Verständnis und Plausibilität.
                  </p>
                </div>
                <CalculationWorkbench extraction={data} compactChrome />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
