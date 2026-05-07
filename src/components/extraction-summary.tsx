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

function ParamTable({ rows }: { rows: { param: string; value: string }[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[300px] text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-100 text-left dark:border-zinc-800 dark:bg-zinc-900">
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
            >
              Parameter
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
            >
              Wert
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-zinc-100 last:border-0 odd:bg-white even:bg-zinc-50/70 dark:border-zinc-800/80 dark:odd:bg-zinc-950/20 dark:even:bg-zinc-900/40"
            >
              <th
                scope="row"
                className="px-4 py-2.5 text-left font-normal text-zinc-600 dark:text-zinc-400"
              >
                {r.param}
              </th>
              <td className="px-4 py-2.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TypedParameterSection({
  id,
  typeCode,
  title,
  description,
  children,
}: {
  id: string;
  typeCode: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-32 border-b border-zinc-200 pb-10 last:border-b-0 last:pb-0 dark:border-zinc-800"
    >
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-start gap-3">
          <span
            className="mt-0.5 shrink-0 rounded border border-zinc-300 bg-zinc-900 px-2 py-1 font-mono text-[10px] font-bold tracking-[0.15em] text-white dark:border-zinc-600 dark:bg-zinc-100 dark:text-zinc-900"
            title="Typ / Gruppencode"
          >
            {typeCode}
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}

const PARAM_JUMP_LINKS: { id: string; label: string }[] = [
  { id: "param-gruppe-rahmen", label: "Rahmen" },
  { id: "param-gruppe-zusage", label: "Zusage" },
  { id: "param-gruppe-zugang", label: "Zugang" },
  { id: "param-gruppe-beitrag", label: "Beitrag" },
  { id: "param-gruppe-unverfall", label: "Unverfallbarkeit" },
  { id: "param-gruppe-leistung", label: "Leistung" },
  { id: "param-gruppe-anpassung", label: "Anpassung" },
  { id: "param-gruppe-offen", label: "Offen" },
];

function ParameterSubnav() {
  return (
    <nav
      className="-mx-4 mb-8 flex flex-wrap gap-2 border-b border-zinc-200 px-4 pb-4 md:mx-0 md:rounded-xl md:border md:bg-zinc-50/90 md:px-4 md:py-3 dark:border-zinc-800 dark:bg-zinc-900/50"
      aria-label="Zu Parametergruppen springen"
    >
      <span className="hidden w-full text-[10px] font-bold uppercase tracking-widest text-zinc-400 md:block">
        In der Liste springen
      </span>
      <div className="flex w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap [&::-webkit-scrollbar]:hidden">
        {PARAM_JUMP_LINKS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:border-indigo-400 hover:text-indigo-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-indigo-500 dark:hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
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

  const schemeOpenLabel =
    scheme.openForNewEntries === null ? "—" : scheme.openForNewEntries ? "Ja" : "Nein";

  return (
    <div className="space-y-0">
      <ParameterSubnav />

      <p className="mb-10 text-sm text-zinc-600 dark:text-zinc-400">
        Unten finden Sie eine <strong>Parameterliste</strong>: eine Zeile pro erkanntem
        Feld, gruppiert nach <strong>Typ-Codes</strong> (Rahmen, Zusage, Beitrag …).
        Unter den Tabellen stehen die Fundstellen in der VO.
      </p>

      <TypedParameterSection
        id="param-gruppe-rahmen"
        typeCode="RAHMEN"
        title="Rahmenangaben & Dokument"
        description="Dateiname, Stand der VO, Extraktionszeitpunkt, Modell, Vertrauen in die Lesart."
      >
        <ParamTable
          rows={[
            { param: "Datei", value: formatDash(metadata.documentName) },
            { param: "Stand laut VO", value: formatDash(metadata.documentDate) },
            {
              param: "Extraktion (Zeitpunkt)",
              value: metadata.extractedAt
                ? new Date(metadata.extractedAt).toLocaleString("de-DE")
                : "—",
            },
            { param: "Modell", value: formatDash(metadata.modelVersion) },
            { param: "Qualität (KI)", value: confidenceDe(metadata.confidence) },
          ]}
        />
      </TypedParameterSection>

      <TypedParameterSection
        id="param-gruppe-zusage"
        typeCode="ZUSAGE"
        title="Zusage & Rahmen"
        description="Art der Zusage, Durchführungsweg, ob neue Eintritte möglich sind."
      >
        <ParamTable
          rows={[
            { param: "Art der Zusage", value: scheme.type },
            { param: "Durchführung", value: scheme.implementation },
            { param: "Für neue Eintritte geöffnet", value: schemeOpenLabel },
            { param: "Schließung / Ende", value: formatDash(scheme.closingDate) },
          ]}
        />
      </TypedParameterSection>

      <TypedParameterSection
        id="param-gruppe-zugang"
        typeCode="ZUGANG"
        title="Zugang, Wartezeit & Ausschlüsse"
        description="Teilnahmevoraussetzungen und ausgeschlossene Personengruppen."
      >
        <ParamTable
          rows={[
            {
              param: "Mindestalter (Jahre)",
              value: formatNumberDe(eligibility.minAge.value),
            },
            {
              param: "Wartezeit (Monate)",
              value: formatNumberDe(eligibility.waitingPeriod.months),
            },
            {
              param: "Ausgeschlossene Gruppen",
              value: eligibility.excludedGroups.length
                ? eligibility.excludedGroups.join(", ")
                : "—",
            },
          ]}
        />
        <SourceBox title="Quelle Mindestalter" source={eligibility.minAge.source} />
        <SourceBox title="Quelle Wartezeit" source={eligibility.waitingPeriod.source} />
      </TypedParameterSection>

      <TypedParameterSection
        id="param-gruppe-beitrag"
        typeCode="BEITRAG"
        title="Beiträge, Bezugsgrößen & Gehalt"
        description="Sätze und Definitionen der Bezugsgröße — getrennt nach Arbeitgeber und Arbeitnehmer."
      >
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
          Arbeitgeberbeitrag
        </h4>
        <ParamTable
          rows={[
            {
              param: "Art",
              value: formatDash(contributions.employerContribution.type),
            },
            {
              param: "Satz",
              value: formatPercentFromDecimal(contributions.employerContribution.rate),
            },
            {
              param: "Bezugsgröße",
              value: formatDash(contributions.employerContribution.base),
            },
            {
              param: "Gehaltsdefinition",
              value: formatDash(contributions.employerContribution.salaryDefinition),
            },
            {
              param: "Deckel / Obergrenze",
              value: formatDash(contributions.employerContribution.salaryCap),
            },
          ]}
        />
        <SourceBox
          title="Quelle Arbeitgeberbeitrag"
          source={contributions.employerContribution.source}
        />

        <h4 className="mb-2 mt-8 text-xs font-bold uppercase tracking-wide text-zinc-500">
          Arbeitnehmerbeitrag (optional)
        </h4>
        <ParamTable
          rows={[
            {
              param: "Art",
              value: formatDash(contributions.employeeContribution.type),
            },
            {
              param: "Höchstbetrag / Grenze",
              value: formatPercentFromDecimal(
                contributions.employeeContribution.maxRate,
              ),
            },
          ]}
        />
        <SourceBox
          title="Quelle Arbeitnehmerbeitrag"
          source={contributions.employeeContribution.source}
        />
      </TypedParameterSection>

      <TypedParameterSection
        id="param-gruppe-unverfall"
        typeCode="UNVERFALL"
        title="Unverfallbarkeit"
        description="Wann Ansprüche unverfallbar werden — Regelwerk und Mindestanforderungen."
      >
        <ParamTable
          rows={[
            { param: "Regelwerk", value: formatDash(vesting.rule) },
            {
              param: "Mindestbetriebszugehörigkeit (Jahre)",
              value: formatNumberDe(vesting.minServiceYears),
            },
            {
              param: "Mindestalter (Jahre)",
              value: formatNumberDe(vesting.minAge),
            },
          ]}
        />
        <SourceBox title="Quelle Unverfallbarkeit" source={vesting.source} />
      </TypedParameterSection>

      <TypedParameterSection
        id="param-gruppe-leistung"
        typeCode="LEISTUNG"
        title="Leistungen & Faktoren"
        description="Alters-, Invaliditäts- und Hinterbliebenenregeln inkl. Sätze und Formeltexte."
      >
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
          Altersleistung
        </h4>
        <ParamTable
          rows={[
            {
              param: "Regelaltersgrenze",
              value: formatDash(benefits.oldAge.regularRetirementAge),
            },
            {
              param: "Vorzeit-Kürzung pro Monat",
              value: formatPercentFromDecimal(
                benefits.oldAge.earlyRetirementReductionPerMonth,
              ),
            },
            {
              param: "Formel (Text)",
              value: formatDash(benefits.oldAge.formula),
            },
            {
              param: "Garantierter Zins p.a.",
              value: formatPercentFromDecimal(benefits.oldAge.guaranteedInterest),
            },
          ]}
        />
        <SourceBox title="Quelle Altersleistung" source={benefits.oldAge.source} />

        <h4 className="mb-2 mt-8 text-xs font-bold uppercase tracking-wide text-zinc-500">
          Invalidität
        </h4>
        <ParamTable
          rows={[
            {
              param: "Anspruchsvoraussetzung",
              value: formatDash(benefits.disability.qualifying),
            },
            { param: "Formel (Text)", value: formatDash(benefits.disability.formula) },
          ]}
        />
        <SourceBox title="Quelle Invalidität" source={benefits.disability.source} />

        <h4 className="mb-2 mt-8 text-xs font-bold uppercase tracking-wide text-zinc-500">
          Hinterbliebene (Tod)
        </h4>
        <ParamTable
          rows={[
            {
              param: "Ehepartner-Anteil",
              value: formatPercentFromDecimal(benefits.death.spouse.rate),
            },
            {
              param: "Wiederheirat (Regelung)",
              value: formatDash(benefits.death.spouse.remarriage),
            },
            {
              param: "Halbwaisen-Anteil",
              value: formatPercentFromDecimal(benefits.death.orphan.halfOrphan),
            },
            {
              param: "Vollwaisen-Anteil",
              value: formatPercentFromDecimal(benefits.death.orphan.fullOrphan),
            },
            {
              param: "Höchstalter Waise (Jahre)",
              value: formatNumberDe(benefits.death.orphan.maxAge),
            },
          ]}
        />
        <SourceBox title="Quelle Ehepartner" source={benefits.death.spouse.source} />
        <SourceBox title="Quelle Waisen" source={benefits.death.orphan.source} />
      </TypedParameterSection>

      <TypedParameterSection
        id="param-gruppe-anpassung"
        typeCode="ANPASSUNG"
        title="Anpassung dynamischer Leistungen"
        description="Regeln zur Fortschreibung dynamischer Leistungsbestandteile."
      >
        <ParamTable
          rows={[
            { param: "Regel (Text)", value: formatDash(adjustment.rule) },
            { param: "Methode", value: formatDash(adjustment.method) },
          ]}
        />
        <SourceBox title="Quelle Anpassung" source={adjustment.source} />
      </TypedParameterSection>

      <TypedParameterSection
        id="param-gruppe-offen"
        typeCode="OFFEN"
        title="Offene Klärpunkte"
        description="Von der KI markierte Lücken — bitte manuell mit der VO abgleichen."
      >
        {openQuestions.length ? (
          <div className="overflow-x-auto rounded-lg border border-amber-200 dark:border-amber-900">
            <table className="w-full min-w-[280px] text-sm">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50 text-left dark:border-amber-900 dark:bg-amber-950/50">
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
                    Thema
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
                    Dringlichkeit
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
                    Anmerkung
                  </th>
                </tr>
              </thead>
              <tbody>
                {openQuestions.map((q, i) => (
                  <tr
                    key={i}
                    className="border-b border-amber-100 last:border-0 odd:bg-white even:bg-amber-50/40 dark:border-amber-900/40 dark:odd:bg-zinc-950/30 dark:even:bg-amber-950/20"
                  >
                    <td className="px-4 py-2.5 font-medium text-amber-950 dark:text-amber-100">
                      {q.topic}
                    </td>
                    <td className="px-4 py-2.5 text-amber-900 dark:text-amber-200">
                      {q.urgency}
                    </td>
                    <td className="px-4 py-2.5 text-amber-900 dark:text-amber-100">
                      {q.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ParamTable
            rows={[
              {
                param: "Manuelle Prüfung",
                value: "Keine offenen Punkte von der KI gemeldet",
              },
            ]}
          />
        )}
      </TypedParameterSection>
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
