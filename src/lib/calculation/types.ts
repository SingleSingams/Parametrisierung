import type { BbgRegion, BbgTarifVariant } from "@/lib/reference-data/bbg-service";

/** Einzelne Rechenschritt-Ausgabe für UI / Audit-Trail. */
export type CalculationStep = {
  key: string;
  label: string;
  valueEur?: number;
  detail?: string;
};

export type SalaryHistoryEntry = {
  calendarYear: number;
  /** Bruttojahresgehalt sozialversicherungspflichtig (Ist-Wert, vor BBG-Kappung) */
  grossAnnualSalaryEur: number;
  /** Region für BBG-Auswahl (West = altes Bundesgebiet, East = Beitrittsgebiet). */
  region: BbgRegion;
};

export type BoLzEmployerContributionParams = {
  /** Arbeitgeberanteil als Dezimalzahl, z. B. 0,04 für 4 %. */
  employerRate: number;
  /** Welche BBG-Spalte herangezogen wird (Standard Arbeitnehmer). */
  bbgVariant?: BbgTarifVariant;
};

export type BenefitComputationResult = {
  benefitType: "oldAge" | "disability" | "death" | "earlyExitWithVesting";
  /** Brutto-Leistungsbetrag nach POC-Skelettlogik; null = nicht berechenbar. */
  grossBenefitEur: number | null;
  steps: CalculationStep[];
};
