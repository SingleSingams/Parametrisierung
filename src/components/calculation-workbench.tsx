"use client";

import { useEffect, useMemo, useState } from "react";

import type { VoBolzDirektzusageV1 } from "@/lib/schema";
import {
  calculateDeathBenefitsSkeleton,
  calculateDisabilityBenefitSkeleton,
  calculateEarlyExitWithVestingSkeleton,
  calculateOldAgeBenefitSkeleton,
  type BenefitComputationResult,
} from "@/lib/calculation";
import type { SalaryHistoryEntry } from "@/lib/calculation/types";
import {
  formatEur,
  formatNumberDe,
  formatPercentFromDecimal,
} from "@/lib/presenters/formatters";

type Row = { year: number; gross: string; region: "west" | "east" };

function initialSalaryRows(): Row[] {
  const y = new Date().getFullYear();
  return [{ year: y, gross: "", region: "west" as const }];
}

function VoExtractionSnapshot({ data }: { data: VoBolzDirektzusageV1 }) {
  const pct = (v: number | null | undefined) =>
    v == null || Number.isNaN(v) ? "—" : formatPercentFromDecimal(v);
  const num = (v: number | null | undefined) =>
    v == null || Number.isNaN(v) ? "—" : formatNumberDe(v);
  const rag = data.benefits.oldAge.regularRetirementAge;
  return (
    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
      <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-800 dark:text-indigo-300">
        Aus Ihrer Extraktion
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {data.metadata.documentName}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="min-w-[5.5rem] rounded-lg border border-white/80 bg-white/90 px-2 py-1.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
          <span className="block text-[10px] font-medium uppercase text-zinc-500">
            AG-Anteil
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {pct(data.contributions.employerContribution.rate)}
          </span>
        </div>
        <div className="min-w-[5.5rem] rounded-lg border border-white/80 bg-white/90 px-2 py-1.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
          <span className="block text-[10px] font-medium uppercase text-zinc-500">
            Garantiezins
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {pct(data.benefits.oldAge.guaranteedInterest)}
          </span>
        </div>
        <div className="min-w-[5.5rem] rounded-lg border border-white/80 bg-white/90 px-2 py-1.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
          <span className="block text-[10px] font-medium uppercase text-zinc-500">
            Kürz./Mon.
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {pct(data.benefits.oldAge.earlyRetirementReductionPerMonth)}
          </span>
        </div>
        <div className="min-w-[6rem] flex-1 rounded-lg border border-white/80 bg-white/90 px-2 py-1.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
          <span className="block text-[10px] font-medium uppercase text-zinc-500">
            Regelalter (Text)
          </span>
          <span className="line-clamp-2 font-semibold text-zinc-900 dark:text-zinc-100">
            {rag != null && String(rag).trim() !== "" ? String(rag) : "—"}
          </span>
        </div>
        <div className="min-w-[5.5rem] rounded-lg border border-white/80 bg-white/90 px-2 py-1.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
          <span className="block text-[10px] font-medium uppercase text-zinc-500">
            Witwe %
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {pct(data.benefits.death.spouse.rate)}
          </span>
        </div>
        <div className="min-w-[5.5rem] rounded-lg border border-white/80 bg-white/90 px-2 py-1.5 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
          <span className="block text-[10px] font-medium uppercase text-zinc-500">
            Waise max.
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {num(data.benefits.death.orphan.maxAge)}
          </span>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-indigo-900/80 dark:text-indigo-200/90">
        Die Felder unten starten leer bzw. mit Ihren VO-Werten — keine festen
        Demo-Gehälter mehr.
      </p>
    </div>
  );
}

function parseRows(rows: Row[]): SalaryHistoryEntry[] {
  return rows
    .filter((r) => Number.isFinite(r.year) && r.year > 1900)
    .map((r) => ({
      calendarYear: r.year,
      grossAnnualSalaryEur: Math.max(0, parseFloat(r.gross.replace(",", ".")) || 0),
      region: r.region,
    }));
}

function StepList({ result }: { result: BenefitComputationResult }) {
  return (
    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
      {result.steps.map((s) => (
        <li key={s.key}>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {s.label}
          </span>
          {s.valueEur !== undefined ? (
            <span className="ml-2 text-emerald-700 dark:text-emerald-400">
              {formatEur(s.valueEur)}
            </span>
          ) : null}
          {s.detail ? (
            <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
              {s.detail}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

type Props = {
  extraction: VoBolzDirektzusageV1 | null;
  /** Reduziert Kopfzeilen, wenn der äußere Bereich (Berechnungslabor) schon erklärt. */
  compactChrome?: boolean;
};

export function CalculationWorkbench({ extraction, compactChrome }: Props) {
  const defaults = useMemo(() => {
    const rate = extraction?.contributions.employerContribution.rate ?? 0.04;
    const g = extraction?.benefits.oldAge.guaranteedInterest ?? 0.0125;
    const red = extraction?.benefits.oldAge.earlyRetirementReductionPerMonth ?? 0.003;
    const spouse = extraction?.benefits.death.spouse.rate ?? 0.6;
    const half = extraction?.benefits.death.orphan.halfOrphan ?? 0.1;
    const full = extraction?.benefits.death.orphan.fullOrphan ?? 0.2;
    return { rate, g, red, spouse, half, full };
  }, [extraction]);

  const [rows, setRows] = useState<Row[]>(initialSalaryRows);
  const [valuationYear, setValuationYear] = useState(() => new Date().getFullYear());
  const [earlyMonths, setEarlyMonths] = useState(0);
  const [employerRate, setEmployerRate] = useState("");
  const [guaranteed, setGuaranteed] = useState("");
  const [redPerMonth, setRedPerMonth] = useState("");
  const [refDeath, setRefDeath] = useState("");
  const [isVested, setIsVested] = useState(true);
  const [oldAge, setOldAge] = useState<BenefitComputationResult | null>(null);
  const [dis, setDis] = useState<BenefitComputationResult | null>(null);
  const [death, setDeath] = useState<BenefitComputationResult | null>(null);
  const [exit, setExit] = useState<BenefitComputationResult | null>(null);

  useEffect(() => {
    if (!extraction) return;
    setRows(initialSalaryRows());
    const r = extraction.contributions.employerContribution.rate;
    setEmployerRate(r != null && !Number.isNaN(r) ? String(r) : "");
    const g = extraction.benefits.oldAge.guaranteedInterest;
    setGuaranteed(g != null && !Number.isNaN(g) ? String(g) : "");
    const red = extraction.benefits.oldAge.earlyRetirementReductionPerMonth;
    setRedPerMonth(red != null && !Number.isNaN(red) ? String(red) : "");
    setRefDeath("");
    setOldAge(null);
    setDis(null);
    setDeath(null);
    setExit(null);
  }, [extraction]);

  if (!extraction) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Rechner (Skelett)
        </h2>
        <p className="mt-2">
          Nach einer erfolgreichen Extraktion können Sie hier Beispiel-Bruttos eingeben
          und eine vereinfachte Kapitalrechnung ausführen.
        </p>
      </section>
    );
  }

  const salaryHistory = parseRows(rows);
  const rateNum = parseFloat(employerRate.replace(",", ".")) || 0;
  const gNum = parseFloat(guaranteed.replace(",", ".")) || 0;
  const redNum = parseFloat(redPerMonth.replace(",", ".")) || 0;
  const refNum = parseFloat(refDeath.replace(",", ".")) || 0;

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
      {!compactChrome ? (
        <div
          className="h-1 w-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-violet-500"
          aria-hidden
        />
      ) : null}
      <div className={`space-y-5 ${compactChrome ? "p-4 sm:p-5" : "p-5 sm:p-6"}`}>
        {!compactChrome ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Interaktiv
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Rechner (Skelett)
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Nutzen Sie die aus der VO übernommenen Sätze oder passen Sie sie an, und
              spielen Sie Beispiel-Bruttolöhne durch. Die Logik ist bewusst einfach
              (linear, ohne Biometrie) — zum Verständnis und zum Abgleich, nicht für die
              Schlussprüfung.
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Sätze aus der Extraktion sind vorbefüllt und können hier angepasst werden.
          </p>
        )}

        <VoExtractionSnapshot data={extraction} />

        <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Sätze für die Rechnung (editierbar)
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Arbeitgeber-Anteil (Dezimal, z. B. 0,04)
              <input
                className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={employerRate}
                onChange={(e) => setEmployerRate(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Garantiezins p.a. (Dezimal)
              <input
                className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={guaranteed}
                onChange={(e) => setGuaranteed(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Vorzeit-Kürzung pro Monat (Dezimal)
              <input
                className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={redPerMonth}
                onChange={(e) => setRedPerMonth(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Bruttolöhne für die Simulation (EUR / Jahr)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Keine vorbelegten Demo-Beträge — bitte Ihre Plan- oder Ist-Bruttos eintragen.
          </p>
          {rows.map((r, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Jahr
                <input
                  type="number"
                  className="w-24 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  value={r.year}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setRows((prev) =>
                      prev.map((x, j) => (j === i ? { ...x, year: v } : x)),
                    );
                  }}
                />
              </label>
              <label className="flex min-w-[8rem] flex-1 flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Brutto
                <input
                  className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  placeholder="z. B. 85000"
                  value={r.gross}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRows((prev) =>
                      prev.map((x, j) => (j === i ? { ...x, gross: v } : x)),
                    );
                  }}
                />
              </label>
              <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
                BBG-Region
                <select
                  className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  value={r.region}
                  onChange={(e) => {
                    const v = e.target.value as "west" | "east";
                    setRows((prev) =>
                      prev.map((x, j) => (j === i ? { ...x, region: v } : x)),
                    );
                  }}
                >
                  <option value="west">West (alte Länder)</option>
                  <option value="east">Ost (Beitritt)</option>
                </select>
              </label>
              <button
                type="button"
                className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
              >
                Zeile entfernen
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
            onClick={() =>
              setRows((prev) => [
                ...prev,
                {
                  year: (prev[prev.length - 1]?.year ?? new Date().getFullYear()) + 1,
                  gross: "",
                  region: "west",
                },
              ])
            }
          >
            Jahr hinzufügen
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Bewertungsjahr (Aufzinsung)
            <input
              type="number"
              className="w-28 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={valuationYear}
              onChange={(e) => setValuationYear(parseInt(e.target.value, 10) || 2026)}
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Monate vor Regelalter (0 = keine Kürzung)
            <input
              type="number"
              className="w-28 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={earlyMonths}
              onChange={(e) => setEarlyMonths(parseInt(e.target.value, 10) || 0)}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            onClick={() =>
              setOldAge(
                calculateOldAgeBenefitSkeleton({
                  salaryHistory,
                  contributionParams: { employerRate: rateNum },
                  guaranteedAnnualInterestRate: gNum,
                  valuationYear,
                  earlyRetirementMonthsBeforeNra: earlyMonths,
                  earlyRetirementReductionPerMonth: redNum,
                }),
              )
            }
          >
            Alters-Kapital berechnen
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            onClick={() =>
              setDis(
                calculateDisabilityBenefitSkeleton({
                  salaryHistory,
                  contributionParams: { employerRate: rateNum },
                  guaranteedAnnualInterestRate: gNum,
                  valuationYear,
                }),
              )
            }
          >
            Invalidität (gleiche Kapitalbasis)
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            onClick={() =>
              setDeath(
                calculateDeathBenefitsSkeleton({
                  referenceBenefitEur: refNum,
                  spouseRate: defaults.spouse,
                  orphanHalfRate: defaults.half,
                  orphanFullRate: defaults.full,
                }),
              )
            }
          >
            Hinterbliebene (auf Bezugsbetrag)
          </button>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isVested}
              onChange={(e) => setIsVested(e.target.checked)}
            />
            Unverfallbar (Ausscheiden)
          </label>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            onClick={() =>
              setExit(
                calculateEarlyExitWithVestingSkeleton({
                  salaryHistory,
                  contributionParams: { employerRate: rateNum },
                  guaranteedAnnualInterestRate: gNum,
                  valuationYear,
                  isVested,
                }),
              )
            }
          >
            Ausscheiden mit Unverfallbarkeit
          </button>
        </div>

        <label className="flex max-w-xs flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Bezugsbetrag für Witwen-Rechner (EUR)
          <input
            className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={refDeath}
            onChange={(e) => setRefDeath(e.target.value)}
          />
        </label>

        {oldAge ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <h4 className="font-semibold text-emerald-950 dark:text-emerald-100">
              Alters-Kapital (Skelett)
            </h4>
            <p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-200">
              {formatEur(oldAge.grossBenefitEur ?? null)}
            </p>
            <StepList result={oldAge} />
          </div>
        ) : null}

        {dis ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900 dark:bg-sky-950/30">
            <h4 className="font-semibold text-sky-950 dark:text-sky-100">
              Invalidität (Skelett)
            </h4>
            <p className="mt-1 text-lg font-bold text-sky-900 dark:text-sky-200">
              {formatEur(dis.grossBenefitEur ?? null)}
            </p>
            <StepList result={dis} />
          </div>
        ) : null}

        {death ? (
          <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900 dark:bg-violet-950/30">
            <h4 className="font-semibold text-violet-950 dark:text-violet-100">
              Hinterbliebene (Summe der Sätze)
            </h4>
            <p className="mt-1 text-lg font-bold text-violet-900 dark:text-violet-200">
              {formatEur(death.grossBenefitEur ?? null)}
            </p>
            <StepList result={death} />
          </div>
        ) : null}

        {exit ? (
          <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-4 dark:border-orange-900 dark:bg-orange-950/30">
            <h4 className="font-semibold text-orange-950 dark:text-orange-100">
              Vorzeitiges Ausscheiden
            </h4>
            <p className="mt-1 text-lg font-bold text-orange-900 dark:text-orange-200">
              {formatEur(exit.grossBenefitEur ?? null)}
            </p>
            <StepList result={exit} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
