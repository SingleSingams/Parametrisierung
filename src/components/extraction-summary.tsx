"use client";

import type { VoBolzDirektzusageV1 } from "@/lib/schema";
import {
  confidenceDe,
  formatDash,
  formatNumberDe,
  formatPercentFromDecimal,
} from "@/lib/presenters/formatters";

function SourceBox({
  title,
  source,
}: {
  title: string;
  source: {
    page: number | null;
    para: string | null;
    quote: string | null;
  };
}) {
  return (
    <div className="mt-2 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="font-medium text-zinc-800 dark:text-zinc-200">{title}</div>
      <div className="mt-0.5">
        {source.page != null ? `Seite ${source.page}` : "Seite: nicht angegeben"}
        {source.para ? ` · ${source.para}` : ""}
      </div>
      {source.quote ? (
        <blockquote className="mt-1 border-l-2 border-amber-400 pl-2 text-zinc-700 dark:border-amber-600 dark:text-zinc-300">
          „{source.quote}“
        </blockquote>
      ) : (
        <p className="mt-1 text-zinc-500">Kein Zitat hinterlegt.</p>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-4">
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

type Props = {
  data: VoBolzDirektzusageV1;
  rawJson: string;
};

export function ExtractionSummary({ data, rawJson }: Props) {
  const {
    metadata,
    scheme,
    eligibility,
    contributions,
    vesting,
    benefits,
    adjustment,
    openQuestions,
  } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Auswertung in Klartext</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Die wichtigsten Regeln aus der VO — so, wie sie die KI gelesen hat. Bitte
          gegen das Original prüfen, besonders die Zitate in den grauen Kästen.
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-semibold">Dokument und Modell</h3>
        <dl className="mt-3 space-y-2">
          <Field label="Datei" value={formatDash(metadata.documentName)} />
          <Field label="Stand laut VO" value={formatDash(metadata.documentDate)} />
          <Field
            label="Extraktion"
            value={
              metadata.extractedAt
                ? new Date(metadata.extractedAt).toLocaleString("de-DE")
                : "—"
            }
          />
          <Field label="Modell" value={formatDash(metadata.modelVersion)} />
          <Field
            label="Einschätzung Qualität (KI)"
            value={confidenceDe(metadata.confidence)}
          />
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-semibold">Zusage</h3>
        <dl className="mt-3 space-y-2">
          <Field label="Art" value={scheme.type} />
          <Field label="Durchführung" value={scheme.implementation} />
          <Field
            label="Für neue Eintritte geöffnet"
            value={
              scheme.openForNewEntries === null
                ? "—"
                : scheme.openForNewEntries
                  ? "Ja"
                  : "Nein"
            }
          />
          <Field label="Schließung" value={formatDash(scheme.closingDate)} />
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-semibold">Zugang und Wartezeit</h3>
        <dl className="mt-3 space-y-2">
          <Field
            label="Mindestalter (Jahre)"
            value={formatNumberDe(eligibility.minAge.value)}
          />
          <SourceBox title="Quelle Mindestalter" source={eligibility.minAge.source} />
          <Field
            label="Wartezeit (Monate)"
            value={formatNumberDe(eligibility.waitingPeriod.months)}
          />
          <SourceBox
            title="Quelle Wartezeit"
            source={eligibility.waitingPeriod.source}
          />
          <Field
            label="Ausgeschlossene Gruppen"
            value={
              eligibility.excludedGroups.length
                ? eligibility.excludedGroups.join(", ")
                : "—"
            }
          />
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-semibold">Beiträge</h3>
        <h4 className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Arbeitgeber
        </h4>
        <dl className="mt-2 space-y-2">
          <Field
            label="Art"
            value={formatDash(contributions.employerContribution.type)}
          />
          <Field
            label="Satz"
            value={formatPercentFromDecimal(contributions.employerContribution.rate)}
          />
          <Field
            label="Bezugsgröße"
            value={formatDash(contributions.employerContribution.base)}
          />
          <Field
            label="Gehaltsdefinition"
            value={formatDash(contributions.employerContribution.salaryDefinition)}
          />
          <Field
            label="Deckel"
            value={formatDash(contributions.employerContribution.salaryCap)}
          />
        </dl>
        <SourceBox
          title="Quelle Arbeitgeberbeitrag"
          source={contributions.employerContribution.source}
        />
        <h4 className="mt-5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Arbeitnehmer (optional)
        </h4>
        <dl className="mt-2 space-y-2">
          <Field
            label="Art"
            value={formatDash(contributions.employeeContribution.type)}
          />
          <Field
            label="Höchstbetrag"
            value={formatPercentFromDecimal(contributions.employeeContribution.maxRate)}
          />
        </dl>
        <SourceBox
          title="Quelle Arbeitnehmerbeitrag"
          source={contributions.employeeContribution.source}
        />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-semibold">Unverfallbarkeit</h3>
        <dl className="mt-3 space-y-2">
          <Field label="Regelwerk" value={formatDash(vesting.rule)} />
          <Field
            label="Mindestbetriebszugehörigkeit (Jahre)"
            value={formatNumberDe(vesting.minServiceYears)}
          />
          <Field label="Mindestalter (Jahre)" value={formatNumberDe(vesting.minAge)} />
        </dl>
        <SourceBox title="Quelle Unverfallbarkeit" source={vesting.source} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-semibold">Leistungen (Auszug)</h3>
        <h4 className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Alter
        </h4>
        <dl className="mt-2 space-y-2">
          <Field
            label="Regelaltersgrenze"
            value={formatDash(benefits.oldAge.regularRetirementAge)}
          />
          <Field
            label="Vorzeit-Kürzung pro Monat"
            value={formatPercentFromDecimal(
              benefits.oldAge.earlyRetirementReductionPerMonth,
            )}
          />
          <Field label="Formel (Text)" value={formatDash(benefits.oldAge.formula)} />
          <Field
            label="Garantierter Zins pro Jahr"
            value={formatPercentFromDecimal(benefits.oldAge.guaranteedInterest)}
          />
        </dl>
        <SourceBox title="Quelle Altersleistung" source={benefits.oldAge.source} />

        <h4 className="mt-5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Invalidität
        </h4>
        <dl className="mt-2 space-y-2">
          <Field
            label="Anspruchsvoraussetzung"
            value={formatDash(benefits.disability.qualifying)}
          />
          <Field label="Formel" value={formatDash(benefits.disability.formula)} />
        </dl>
        <SourceBox title="Quelle Invalidität" source={benefits.disability.source} />

        <h4 className="mt-5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tod
        </h4>
        <dl className="mt-2 space-y-2">
          <Field
            label="Ehepartner-Anteil"
            value={formatPercentFromDecimal(benefits.death.spouse.rate)}
          />
          <Field
            label="Wiederheirat"
            value={formatDash(benefits.death.spouse.remarriage)}
          />
        </dl>
        <SourceBox title="Quelle Ehepartner" source={benefits.death.spouse.source} />
        <dl className="mt-3 space-y-2">
          <Field
            label="Halbwaisen"
            value={formatPercentFromDecimal(benefits.death.orphan.halfOrphan)}
          />
          <Field
            label="Vollwaisen"
            value={formatPercentFromDecimal(benefits.death.orphan.fullOrphan)}
          />
          <Field
            label="Höchstalter Waise"
            value={formatNumberDe(benefits.death.orphan.maxAge)}
          />
        </dl>
        <SourceBox title="Quelle Waisen" source={benefits.death.orphan.source} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-semibold">Anpassung dynamischer Leistungen</h3>
        <dl className="mt-3 space-y-2">
          <Field label="Regel" value={formatDash(adjustment.rule)} />
          <Field label="Methode" value={formatDash(adjustment.method)} />
        </dl>
        <SourceBox title="Quelle Anpassung" source={adjustment.source} />
      </section>

      {openQuestions.length ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
          <h3 className="text-base font-semibold text-amber-950 dark:text-amber-100">
            Offene Punkte (manuell prüfen)
          </h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-amber-950 dark:text-amber-100">
            {openQuestions.map((q, i) => (
              <li key={i}>
                <span className="font-medium">{q.topic}</span> ({q.urgency}): {q.reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <details className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900/50">
        <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
          Technische Rohdaten (JSON)
        </summary>
        <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-white p-3 text-xs dark:bg-zinc-950">
          {rawJson}
        </pre>
      </details>
    </div>
  );
}
