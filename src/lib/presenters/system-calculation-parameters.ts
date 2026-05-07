import type { VoBolzDirektzusageV1 } from "@/lib/schema";
import {
  formatDash,
  formatNumberDe,
  formatPercentFromDecimal,
} from "@/lib/presenters/formatters";

export type SystemParamStatus = "ok" | "missing" | "review";

export type SystemCalculationParameterRow = {
  category: string;
  /** Kurzer, merkbarer Code für Konfiguration / Tickets (ohne Punkt-Notation). */
  code: string;
  /** Vollständiger JSON-Pfad im Schema BoLZ_Direktzusage_v1 (für Entwickler). */
  schemaPath: string;
  label: string;
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
 * Flache Liste von Parametern für Berechnungs- / Verwaltungslogik.
 * `code` ist bewusst kurz; `schemaPath` mappt auf das Extraktions-JSON.
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
      code: r.code,
      schemaPath: r.schemaPath,
      label: r.label,
      purpose: r.purpose,
      valueDisplay,
      status,
    });
  };

  push({
    category: "Zusage",
    code: "ZU_NEU",
    schemaPath: "scheme.openForNewEntries",
    label: "Neueintritte erlaubt",
    purpose: "Zulassung / Migration",
    value:
      scheme.openForNewEntries === null
        ? null
        : scheme.openForNewEntries
          ? "ja"
          : "nein",
    kind: "text",
  });

  push({
    category: "Beitrag",
    code: "BG_AG_SATZ",
    schemaPath: "contributions.employerContribution.rate",
    label: "Arbeitgeber-Anteil",
    purpose: "Ansparzuschlag / Bezugsgröße",
    value: contributions.employerContribution.rate,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Beitrag",
    code: "BG_AG_BEZUG",
    schemaPath: "contributions.employerContribution.base",
    label: "Bezugsgröße",
    purpose: "Bemessungsgrundlage",
    value: contributions.employerContribution.base,
    kind: "text",
  });
  push({
    category: "Beitrag",
    code: "BG_AG_BRUTTO",
    schemaPath: "contributions.employerContribution.salaryDefinition",
    label: "Gehaltsdefinition",
    purpose: "Welches Brutto zählt",
    value: contributions.employerContribution.salaryDefinition,
    kind: "text",
    needsReview: true,
  });
  push({
    category: "Beitrag",
    code: "BG_AG_DECKEL",
    schemaPath: "contributions.employerContribution.salaryCap",
    label: "Deckel / Obergrenze",
    purpose: "Beitragsbemessung cap",
    value: contributions.employerContribution.salaryCap,
    kind: "text",
  });
  push({
    category: "Beitrag",
    code: "BG_AG_ART",
    schemaPath: "contributions.employerContribution.type",
    label: "AG-Beitragsart",
    purpose: "Art der Zuführung",
    value: contributions.employerContribution.type,
    kind: "text",
  });
  push({
    category: "Beitrag",
    code: "BG_AN_MAX",
    schemaPath: "contributions.employeeContribution.maxRate",
    label: "AN-Höchstgrenze",
    purpose: "Eigenbeitrag / Umwandlung",
    value: contributions.employeeContribution.maxRate,
    kind: "number",
    displayPercent: true,
  });

  push({
    category: "Zugang",
    code: "ZG_MIN_ALT",
    schemaPath: "eligibility.minAge.value",
    label: "Mindestalter (Jahre)",
    purpose: "Teilnahmealter",
    value: eligibility.minAge.value,
    kind: "number",
  });
  push({
    category: "Zugang",
    code: "ZG_WARTE",
    schemaPath: "eligibility.waitingPeriod.months",
    label: "Wartezeit (Monate)",
    purpose: "Wartezeitregel",
    value: eligibility.waitingPeriod.months,
    kind: "number",
  });

  push({
    category: "Unverfallbarkeit",
    code: "UV_BJ",
    schemaPath: "vesting.minServiceYears",
    label: "Mindest-BZ (Jahre)",
    purpose: "Vesting",
    value: vesting.minServiceYears,
    kind: "number",
  });
  push({
    category: "Unverfallbarkeit",
    code: "UV_MIN_ALT",
    schemaPath: "vesting.minAge",
    label: "Mindestalter UV (Jahre)",
    purpose: "Vesting",
    value: vesting.minAge,
    kind: "number",
  });
  push({
    category: "Unverfallbarkeit",
    code: "UV_REGEL",
    schemaPath: "vesting.rule",
    label: "Unverfallbarkeitsregel",
    purpose: "Normbezug",
    value: vesting.rule,
    kind: "text",
    needsReview: true,
  });

  push({
    category: "Alter",
    code: "ALT_RAG",
    schemaPath: "benefits.oldAge.regularRetirementAge",
    label: "Regelaltersgrenze",
    purpose: "Leistungsalter",
    value: benefits.oldAge.regularRetirementAge,
    kind: "text",
    needsReview: true,
  });
  push({
    category: "Alter",
    code: "ALT_GZINS",
    schemaPath: "benefits.oldAge.guaranteedInterest",
    label: "Garantiezins p.a.",
    purpose: "Kapitalverzinsung",
    value: benefits.oldAge.guaranteedInterest,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Alter",
    code: "ALT_KZ_MON",
    schemaPath: "benefits.oldAge.earlyRetirementReductionPerMonth",
    label: "Vorzeit-Kürzung / Monat",
    purpose: "Vorzeit",
    value: benefits.oldAge.earlyRetirementReductionPerMonth,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Alter",
    code: "ALT_FORMEL",
    schemaPath: "benefits.oldAge.formula",
    label: "Leistungsformel Alter",
    purpose: "Leistungsmodul",
    value: benefits.oldAge.formula,
    kind: "text",
    needsReview: true,
  });

  push({
    category: "Invalidität",
    code: "INV_QUALI",
    schemaPath: "benefits.disability.qualifying",
    label: "Invaliditäts-Voraussetzung",
    purpose: "Biometrie",
    value: benefits.disability.qualifying,
    kind: "text",
    needsReview: true,
  });
  push({
    category: "Invalidität",
    code: "INV_FORMEL",
    schemaPath: "benefits.disability.formula",
    label: "Leistungsformel Inv.",
    purpose: "Leistungsmodul",
    value: benefits.disability.formula,
    kind: "text",
    needsReview: true,
  });

  push({
    category: "Todesfall",
    code: "TOD_EW",
    schemaPath: "benefits.death.spouse.rate",
    label: "Witwen-/Witwer-Anteil",
    purpose: "Hinterbliebene",
    value: benefits.death.spouse.rate,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Todesfall",
    code: "TOD_HW",
    schemaPath: "benefits.death.orphan.halfOrphan",
    label: "Halbwaise",
    purpose: "Hinterbliebene",
    value: benefits.death.orphan.halfOrphan,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Todesfall",
    code: "TOD_VW",
    schemaPath: "benefits.death.orphan.fullOrphan",
    label: "Vollwaise",
    purpose: "Hinterbliebene",
    value: benefits.death.orphan.fullOrphan,
    kind: "number",
    displayPercent: true,
  });
  push({
    category: "Todesfall",
    code: "TOD_W_ALT",
    schemaPath: "benefits.death.orphan.maxAge",
    label: "Höchstalter Waise",
    purpose: "Hinterbliebene",
    value: benefits.death.orphan.maxAge,
    kind: "number",
  });
  push({
    category: "Todesfall",
    code: "TOD_WH",
    schemaPath: "benefits.death.spouse.remarriage",
    label: "Wiederheirat",
    purpose: "Leistungswegfall",
    value: benefits.death.spouse.remarriage,
    kind: "text",
    needsReview: true,
  });

  push({
    category: "Dynamik",
    code: "DYN_REGEL",
    schemaPath: "adjustment.rule",
    label: "Anpassungsregel",
    purpose: "Index / Fortschreibung",
    value: adjustment.rule,
    kind: "text",
    needsReview: true,
  });
  push({
    category: "Dynamik",
    code: "DYN_METH",
    schemaPath: "adjustment.method",
    label: "Anpassungsmethode",
    purpose: "Technik",
    value: adjustment.method,
    kind: "text",
    needsReview: true,
  });

  return rows;
}
