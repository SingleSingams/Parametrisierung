import type { VoBolzDirektzusageV1 } from "@/lib/schema";
import {
  formatDash,
  formatNumberDe,
  formatPercentFromDecimal,
} from "@/lib/presenters/formatters";

export type SystemParamStatus = "ok" | "missing" | "review";

export type SystemCalculationParameterRow = {
  /** Gruppierung nur für die Anzeige */
  category: string;
  /** Stabiler Schlüssel für Mapping ins Zielsystem */
  systemKey: string;
  /** Lesbare Bezeichnung */
  label: string;
  /** Kurz, was in der Motorik gemeint ist */
  purpose: string;
  valueDisplay: string;
  status: SystemParamStatus;
};

function isMissingNumber(v: number | null | undefined): boolean {
  return v === null || v === undefined || Number.isNaN(v);
}

function isMissingText(v: string | null | undefined): boolean {
  if (v === null || v === undefined) return true;
  return String(v).trim() === "";
}

function statusForText(
  v: string | null | undefined,
  needsReview: boolean,
): SystemParamStatus {
  if (isMissingText(v)) return "missing";
  return needsReview ? "review" : "ok";
}

/**
 * Flache Liste von Parametern, die typischerweise in einer Berechnungs- /
 * Verwaltungslogik gepflegt werden müssen (nicht die vollständige VO-Dokumentation).
 */
export function buildSystemCalculationParameterRows(
  data: VoBolzDirektzusageV1,
): SystemCalculationParameterRow[] {
  const { contributions, eligibility, vesting, benefits, adjustment, scheme } = data;

  const rows: SystemCalculationParameterRow[] = [];

  const push = (
    r: Omit<SystemCalculationParameterRow, "valueDisplay" | "status"> & {
      value: string | number | null | undefined;
      kind: "number" | "text";
      needsReview?: boolean;
      /** Nur Zahlen: Prozentanzeige aus Dezimal */
      displayPercent?: boolean;
    },
  ) => {
    const needsReview = r.needsReview ?? false;
    let valueDisplay: string;
    let status: SystemParamStatus;
    if (r.kind === "number") {
      const n = r.value as number | null | undefined;
      if (isMissingNumber(n)) {
        valueDisplay = "—";
        status = "missing";
      } else {
        valueDisplay = r.displayPercent
          ? formatPercentFromDecimal(n)
          : formatNumberDe(n);
        status = "ok";
      }
    } else {
      const t = r.value as string | null | undefined;
      valueDisplay = formatDash(t);
      status = statusForText(t, needsReview);
    }
    rows.push({
      category: r.category,
      systemKey: r.systemKey,
      label: r.label,
      purpose: r.purpose,
      valueDisplay,
      status,
    });
  };

  push({
    category: "Zusage",
    systemKey: "scheme.openForNewEntries",
    label: "Neueintritte erlaubt",
    purpose: "Steuerung Zulassung / Datenmigration",
    value:
      scheme.openForNewEntries === null
        ? null
        : scheme.openForNewEntries
          ? "ja"
          : "nein",
    kind: "text",
  });

  push({
    category: "Beitrag / Ansparung",
    systemKey: "contributions.employerContribution.rate",
    label: "Arbeitgeber-Anteil (Dezimal)",
    purpose: "Kapitalbildung aus Brutto / Bezugsgröße",
    value: contributions.employerContribution.rate,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Beitrag / Ansparung",
    systemKey: "contributions.employerContribution.base",
    label: "Bezugsgröße",
    purpose: "Bemessungsgrundlage im System hinterlegen",
    value: contributions.employerContribution.base,
    kind: "text",
  });
  push({
    category: "Beitrag / Ansparung",
    systemKey: "contributions.employerContribution.salaryDefinition",
    label: "Gehaltsdefinition",
    purpose: "Welches Brutto zählt (Regelwerk)",
    value: contributions.employerContribution.salaryDefinition,
    kind: "text",
    needsReview: true,
  });
  push({
    category: "Beitrag / Ansparung",
    systemKey: "contributions.employerContribution.salaryCap",
    label: "Deckel / Obergrenze",
    purpose: "Cap für Beitragsbemessung",
    value: contributions.employerContribution.salaryCap,
    kind: "text",
  });
  push({
    category: "Beitrag / Ansparung",
    systemKey: "contributions.employerContribution.type",
    label: "AG-Beitragsart",
    purpose: "Art der Zuführung (z. B. fix, prozentual)",
    value: contributions.employerContribution.type,
    kind: "text",
  });
  push({
    category: "Beitrag / Ansparung",
    systemKey: "contributions.employeeContribution.maxRate",
    label: "AN-Höchstgrenze (Dezimal)",
    purpose: "Optional: Entgeltumwandlung / Eigenbeitrag",
    value: contributions.employeeContribution.maxRate,
    kind: "number",
    displayPercent: true,
  });

  push({
    category: "Zugang",
    systemKey: "eligibility.minAge.value",
    label: "Mindestalter (Jahre)",
    purpose: "Teilnahmealter im System",
    value: eligibility.minAge.value,
    kind: "number",
  });
  push({
    category: "Zugang",
    systemKey: "eligibility.waitingPeriod.months",
    label: "Wartezeit (Monate)",
    purpose: "Wartezeitregel im Bestand",
    value: eligibility.waitingPeriod.months,
    kind: "number",
  });

  push({
    category: "Unverfallbarkeit",
    systemKey: "vesting.minServiceYears",
    label: "Mindestbetriebszugehörigkeit (Jahre)",
    purpose: "Vesting-Engine",
    value: vesting.minServiceYears,
    kind: "number",
  });
  push({
    category: "Unverfallbarkeit",
    systemKey: "vesting.minAge",
    label: "Mindestalter Unverfallbarkeit (Jahre)",
    purpose: "Vesting-Engine",
    value: vesting.minAge,
    kind: "number",
  });
  push({
    category: "Unverfallbarkeit",
    systemKey: "vesting.rule",
    label: "Unverfallbarkeitsregel (Text)",
    purpose: "Regelwerk / Paragraphenbezug",
    value: vesting.rule,
    kind: "text",
    needsReview: true,
  });

  push({
    category: "Altersleistung",
    systemKey: "benefits.oldAge.regularRetirementAge",
    label: "Regelaltersgrenze",
    purpose: "Leistungsfall Altersrente / Auszahlungstermin",
    value: benefits.oldAge.regularRetirementAge,
    kind: "text",
    needsReview: true,
  });
  push({
    category: "Altersleistung",
    systemKey: "benefits.oldAge.guaranteedInterest",
    label: "Garantiezins p.a. (Dezimal)",
    purpose: "Kapitalverzinsung im System",
    value: benefits.oldAge.guaranteedInterest,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Altersleistung",
    systemKey: "benefits.oldAge.earlyRetirementReductionPerMonth",
    label: "Vorzeit-Kürzung pro Monat (Dezimal)",
    purpose: "Vorzeitige Inanspruchnahme",
    value: benefits.oldAge.earlyRetirementReductionPerMonth,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Altersleistung",
    systemKey: "benefits.oldAge.formula",
    label: "Leistungsformel Alter (Text)",
    purpose: "Umsetzung im Leistungsmodul",
    value: benefits.oldAge.formula,
    kind: "text",
    needsReview: true,
  });

  push({
    category: "Invalidität",
    systemKey: "benefits.disability.qualifying",
    label: "Invaliditäts-Voraussetzung (Text)",
    purpose: "Biometrie / Anspruchslogik",
    value: benefits.disability.qualifying,
    kind: "text",
    needsReview: true,
  });
  push({
    category: "Invalidität",
    systemKey: "benefits.disability.formula",
    label: "Leistungsformel Invalidität (Text)",
    purpose: "Umsetzung im Leistungsmodul",
    value: benefits.disability.formula,
    kind: "text",
    needsReview: true,
  });

  push({
    category: "Hinterbliebene",
    systemKey: "benefits.death.spouse.rate",
    label: "Witwen-/Witwer-Anteil (Dezimal)",
    purpose: "Todesfallkapital / Rente",
    value: benefits.death.spouse.rate,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Hinterbliebene",
    systemKey: "benefits.death.orphan.halfOrphan",
    label: "Halbwaise (Dezimal)",
    purpose: "Todesfall",
    value: benefits.death.orphan.halfOrphan,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Hinterbliebene",
    systemKey: "benefits.death.orphan.fullOrphan",
    label: "Vollwaise (Dezimal)",
    purpose: "Todesfall",
    value: benefits.death.orphan.fullOrphan,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Hinterbliebene",
    systemKey: "benefits.death.orphan.maxAge",
    label: "Höchstalter Waise (Jahre)",
    purpose: "Todesfall",
    value: benefits.death.orphan.maxAge,
    kind: "number",
  });
  push({
    category: "Hinterbliebene",
    systemKey: "benefits.death.spouse.remarriage",
    label: "Wiederheirat (Regelung)",
    purpose: "Leistungsfortzahlung / Wegfall",
    value: benefits.death.spouse.remarriage,
    kind: "text",
    needsReview: true,
  });

  push({
    category: "Dynamik",
    systemKey: "adjustment.rule",
    label: "Anpassungsregel (Text)",
    purpose: "Index / Nachverzinsung",
    value: adjustment.rule,
    kind: "text",
    needsReview: true,
  });
  push({
    category: "Dynamik",
    systemKey: "adjustment.method",
    label: "Anpassungsmethode",
    purpose: "Technische Umsetzung der Fortschreibung",
    value: adjustment.method,
    kind: "text",
    needsReview: true,
  });

  return rows;
}
