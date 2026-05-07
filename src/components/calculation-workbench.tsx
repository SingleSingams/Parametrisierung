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
import { formatEur } from "@/lib/presenters/formatters";

type Row = { year: number; gross: string; region: "west" | "east" };

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
};

export function CalculationWorkbench({ extraction }: Props) {
  const defaults = useMemo(() => {
    const rate = extraction?.contributions.employerContribution.rate ?? 0.04;
    const g = extraction?.benefits.oldAge.guaranteedInterest ?? 0.0125;
    const red = extraction?.benefits.oldAge.earlyRetirementReductionPerMonth ?? 0.003;
    const spouse = extraction?.benefits.death.spouse.rate ?? 0.6;
    const half = extraction?.benefits.death.orphan.halfOrphan ?? 0.1;
    const full = extraction?.benefits.death.orphan.fullOrphan ?? 0.2;
    return { rate, g, red, spouse, half, full };
  }, [extraction]);

  const [rows, setRows] = useState<Row[]>([
    { year: 2023, gross: "90000", region: "west" },
    { year: 2024, gross: "95000", region: "west" },
  ]);
  const [valuationYear, setValuationYear] = useState(2026);
  const [earlyMonths, setEarlyMonths] = useState(0);
  const [employerRate, setEmployerRate] = useState("0.04");
  const [guaranteed, setGuaranteed] = useState("0.0125");
  const [redPerMonth, setRedPerMonth] = useState("0.003");
  const [refDeath, setRefDeath] = useState("100000");
  const [isVested, setIsVested] = useState(true);
  const [oldAge, setOldAge] = useState<BenefitComputationResult | null>(null);
  const [dis, setDis] = useState<BenefitComputationResult | null>(null);
  const [death, setDeath] = useState<BenefitComputationResult | null>(null);
  const [exit, setExit] = useState<BenefitComputationResult | null>(null);

  useEffect(() => {
    if (!extraction) return;
    setEmployerRate(String(extraction.contributions.employerContribution.rate ?? 0.04));
    setGuaranteed(String(extraction.benefits.oldAge.guaranteedInterest ?? 0.0125));
    setRedPerMonth(
      String(extraction.benefits.oldAge.earlyRetirementReductionPerMonth ?? 0.003),
    );
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
    <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Rechner (Skelett)</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Hier rechnen Sie mit den aus der VO übernommenen Sätzen und Ihren eigenen
          Beispiel-Bruttolöhnen. Die Logik ist bewusst einfach (linear, ohne Biometrie)
          — zum Verständnis und zum Abgleich, nicht für die Schlussprüfung.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Sätze aus der Extraktion (anpassbar)
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
          Beispiel-Bruttolöhne (EUR pro Jahr)
        </h3>
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
                year: (prev[prev.length - 1]?.year ?? 2024) + 1,
                gross: "80000",
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
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
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
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
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
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
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
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
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
    </section>
  );
}
