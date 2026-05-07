"use client";

import type { ReactNode } from "react";

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
    <div className="mt-2 rounded-lg border border-zinc-100 bg-zinc-50/90 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-400">
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

function GroupCard({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle?: string;
  accent: "slate" | "indigo" | "emerald" | "amber" | "violet";
  children: ReactNode;
}) {
  const bar =
    accent === "indigo"
      ? "bg-indigo-500"
      : accent === "emerald"
        ? "bg-emerald-500"
        : accent === "amber"
          ? "bg-amber-500"
          : accent === "violet"
            ? "bg-violet-500"
            : "bg-zinc-400";

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className={`h-1 w-full ${bar}`} aria-hidden />
      <div className="p-5">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        ) : null}
        <div className="mt-4">{children}</div>
      </div>
    </article>
  );
}

function FactTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {sub ? (
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">{sub}</p>
      ) : null}
    </div>
  );
}

export function VoBriefSummary({ data }: { data: VoBolzDirektzusageV1 }) {
  const {
    metadata,
    scheme,
    eligibility,
    contributions,
    vesting,
    benefits,
    openQuestions,
  } = data;

  const schemeOpen =
    scheme.openForNewEntries === null
      ? "Ob neue Eintritte möglich sind, ist unklar."
      : scheme.openForNewEntries
        ? "Die Zusage ist für neue Eintritte geöffnet."
        : "Die Zusage ist für neue Eintritte geschlossen oder eingeschränkt.";

  const rateText = formatPercentFromDecimal(contributions.employerContribution.rate);
  const baseText = formatDash(contributions.employerContribution.base);

  const paragraphs = [
    `Es liegt eine ${scheme.type} vor (${scheme.implementation}). ${schemeOpen}`,
    `Zum Beitrag: Arbeitgeber ${rateText} von der Bezugsgröße „${baseText}“. Gehaltsdefinition und Deckel bitte im Parameter-Tab prüfen.`,
    `Zugang: Mindestalter ${formatNumberDe(eligibility.minAge.value)} Jahre, Wartezeit ${formatNumberDe(eligibility.waitingPeriod.months)} Monate.`,
    `Altersleistung (Auszug): Regelalter ${formatDash(benefits.oldAge.regularRetirementAge)}, Garantiezins ${formatPercentFromDecimal(benefits.oldAge.guaranteedInterest)} p.a.`,
  ];

  if (vesting.rule || vesting.minServiceYears != null) {
    paragraphs.push(
      `Unverfallbarkeit: ${formatDash(vesting.rule)}${vesting.minServiceYears != null ? `, mind. ${formatNumberDe(vesting.minServiceYears)} Jahre Betrieb.` : "."}`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/25">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
          Lesart der KI · Qualität {confidenceDe(metadata.confidence)}
        </p>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {openQuestions.length ? (
          <p className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            <span className="font-semibold">{openQuestions.length} offene Punkte</span>{" "}
            — siehe Register „Parameter“.
          </p>
        ) : null}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Kennzahlen auf einen Blick
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FactTile
            label="AG-Beitragssatz"
            value={rateText}
            sub={formatDash(contributions.employerContribution.type)}
          />
          <FactTile
            label="Wartezeit"
            value={`${formatNumberDe(eligibility.waitingPeriod.months)} Mon.`}
            sub="laut Extraktion"
          />
          <FactTile
            label="Mindestalter"
            value={`${formatNumberDe(eligibility.minAge.value)} J.`}
            sub="Zugang"
          />
          <FactTile
            label="Regelalter"
            value={formatDash(benefits.oldAge.regularRetirementAge)}
            sub="Altersleistung"
          />
        </div>
      </div>
    </div>
  );
}

export function ExtractionParameterGroups({ data }: { data: VoBolzDirektzusageV1 }) {
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
    <div className="space-y-5">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Werte sind nach Typ gruppiert: Rahmenangaben, Zusage, Zugang, Beiträge und
        Bezugsgrößen, Unverfallbarkeit, Leistungsfaktoren und Anpassung. Graue Kästen
        zeigen Fundstellen in der VO.
      </p>

      <GroupCard
        title="Rahmenangaben & Dokument"
        subtitle="Datei, Stand, Modell, Vertrauen in die Extraktion"
        accent="slate"
      >
        <dl className="space-y-2">
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
          <Field label="Qualität (KI)" value={confidenceDe(metadata.confidence)} />
        </dl>
      </GroupCard>

      <GroupCard
        title="Zusage & Rahmen"
        subtitle="Art der Zusage, Durchführung, Zulassung neuer Eintritte"
        accent="indigo"
      >
        <dl className="space-y-2">
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
      </GroupCard>

      <GroupCard
        title="Zugang, Wartezeit & Ausschlüsse"
        subtitle="Wer darf teilnehmen, wie lange muss gewartet werden"
        accent="indigo"
      >
        <dl className="space-y-2">
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
      </GroupCard>

      <GroupCard
        title="Beiträge, Bezugsgrößen & Gehalt"
        subtitle="Sätze und Definitionen, auf denen Beiträge beruhen"
        accent="emerald"
      >
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
      </GroupCard>

      <GroupCard
        title="Unverfallbarkeit"
        subtitle="Wann Ansprüche bestehen bleiben"
        accent="amber"
      >
        <dl className="space-y-2">
          <Field label="Regelwerk" value={formatDash(vesting.rule)} />
          <Field
            label="Mindestbetriebszugehörigkeit (Jahre)"
            value={formatNumberDe(vesting.minServiceYears)}
          />
          <Field label="Mindestalter (Jahre)" value={formatNumberDe(vesting.minAge)} />
        </dl>
        <SourceBox title="Quelle Unverfallbarkeit" source={vesting.source} />
      </GroupCard>

      <GroupCard
        title="Leistungen & Faktoren"
        subtitle="Alter, Invalidität, Hinterbliebene — inkl. Sätze und Formeln"
        accent="violet"
      >
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Alter</h4>
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
      </GroupCard>

      <GroupCard
        title="Anpassung dynamischer Leistungen"
        subtitle="Wie Leistungen fortgeschrieben werden"
        accent="slate"
      >
        <dl className="space-y-2">
          <Field label="Regel" value={formatDash(adjustment.rule)} />
          <Field label="Methode" value={formatDash(adjustment.method)} />
        </dl>
        <SourceBox title="Quelle Anpassung" source={adjustment.source} />
      </GroupCard>

      {openQuestions.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-5 dark:border-amber-900 dark:bg-amber-950/40">
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
        </div>
      ) : null}
    </div>
  );
}

export function ExtractionRawJsonPanel({ rawJson }: { rawJson: string }) {
  return (
    <details className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900/50">
      <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
        Technische Rohdaten (JSON)
      </summary>
      <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-white p-3 text-xs dark:bg-zinc-950">
        {rawJson}
      </pre>
    </details>
  );
}
