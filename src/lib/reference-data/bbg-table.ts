/**
 * Jährliche Beitragsbemessungsgrenzen (BBG) der gesetzlichen Rentenversicherung.
 *
 * Quelle: SGB VI Anlage 2 (allgemeines Bundesgebiet) und Anlage 2a (Beitrittsgebiet),
 * Abruf gesetze-im-internet.de (Fassungen Stand Gesetzgebung 2024/2026).
 *
 * Spalten je Jahr:
 * - `westArbeitnehmer` / `westAngestellte`: Anlage 2 (allgemeine RV), Spaltenfolge Arbeitnehmer | Angestellte.
 * - `eastArbeitnehmer` / `eastAngestellte`: Anlage 2a, ebenfalls Allgemeine RV | Knappschaftliche RV.
 *
 * Hinweise:
 * - 1990/1991 Beitrittsgebiet: mehrere Zeiträume pro Jahr; hier konservative Jahresnäherung für 1991 Ost.
 * - Ab 2025: keine getrennte regional niedrigere Ost-BBG mehr; Ost-Werte = West-Werte (einheitliches Bundesgebiet).
 */

export type BbgAnnualRow = {
  year: number;
  westArbeitnehmerAnnualEur: number;
  westAngestellteAnnualEur: number;
  eastArbeitnehmerAnnualEur: number;
  eastAngestellteAnnualEur: number;
};

/** Lückenlose Jahreswerte 1990–2026 (EUR, jeweils zum 1.1. gültig). */
export const BBG_ANNUAL_TABLE: readonly BbgAnnualRow[] = [
  {
    year: 1990,
    westArbeitnehmerAnnualEur: 75600,
    westAngestellteAnnualEur: 93600,
    eastArbeitnehmerAnnualEur: 32400,
    eastAngestellteAnnualEur: 32400,
  },
  {
    year: 1991,
    westArbeitnehmerAnnualEur: 78000,
    westAngestellteAnnualEur: 96000,
    eastArbeitnehmerAnnualEur: 38400,
    eastAngestellteAnnualEur: 38400,
  },
  {
    year: 1992,
    westArbeitnehmerAnnualEur: 81600,
    westAngestellteAnnualEur: 100800,
    eastArbeitnehmerAnnualEur: 57600,
    eastAngestellteAnnualEur: 70800,
  },
  {
    year: 1993,
    westArbeitnehmerAnnualEur: 86400,
    westAngestellteAnnualEur: 106800,
    eastArbeitnehmerAnnualEur: 63600,
    eastAngestellteAnnualEur: 78000,
  },
  {
    year: 1994,
    westArbeitnehmerAnnualEur: 91200,
    westAngestellteAnnualEur: 112800,
    eastArbeitnehmerAnnualEur: 70800,
    eastAngestellteAnnualEur: 87600,
  },
  {
    year: 1995,
    westArbeitnehmerAnnualEur: 93600,
    westAngestellteAnnualEur: 115200,
    eastArbeitnehmerAnnualEur: 76800,
    eastAngestellteAnnualEur: 93600,
  },
  {
    year: 1996,
    westArbeitnehmerAnnualEur: 96000,
    westAngestellteAnnualEur: 117600,
    eastArbeitnehmerAnnualEur: 81600,
    eastAngestellteAnnualEur: 100800,
  },
  {
    year: 1997,
    westArbeitnehmerAnnualEur: 98400,
    westAngestellteAnnualEur: 121200,
    eastArbeitnehmerAnnualEur: 85200,
    eastAngestellteAnnualEur: 104400,
  },
  {
    year: 1998,
    westArbeitnehmerAnnualEur: 100800,
    westAngestellteAnnualEur: 123600,
    eastArbeitnehmerAnnualEur: 84000,
    eastAngestellteAnnualEur: 103200,
  },
  {
    year: 1999,
    westArbeitnehmerAnnualEur: 102000,
    westAngestellteAnnualEur: 124800,
    eastArbeitnehmerAnnualEur: 86400,
    eastAngestellteAnnualEur: 105600,
  },
  {
    year: 2000,
    westArbeitnehmerAnnualEur: 103200,
    westAngestellteAnnualEur: 127200,
    eastArbeitnehmerAnnualEur: 85200,
    eastAngestellteAnnualEur: 104400,
  },
  {
    year: 2001,
    westArbeitnehmerAnnualEur: 104400,
    westAngestellteAnnualEur: 128400,
    eastArbeitnehmerAnnualEur: 87600,
    eastAngestellteAnnualEur: 108000,
  },
  {
    year: 2002,
    westArbeitnehmerAnnualEur: 54000,
    westAngestellteAnnualEur: 66600,
    eastArbeitnehmerAnnualEur: 45000,
    eastAngestellteAnnualEur: 55800,
  },
  {
    year: 2003,
    westArbeitnehmerAnnualEur: 61200,
    westAngestellteAnnualEur: 75000,
    eastArbeitnehmerAnnualEur: 51000,
    eastAngestellteAnnualEur: 63000,
  },
  {
    year: 2004,
    westArbeitnehmerAnnualEur: 61800,
    westAngestellteAnnualEur: 76200,
    eastArbeitnehmerAnnualEur: 52200,
    eastAngestellteAnnualEur: 64200,
  },
  {
    year: 2005,
    westArbeitnehmerAnnualEur: 62400,
    westAngestellteAnnualEur: 76800,
    eastArbeitnehmerAnnualEur: 52800,
    eastAngestellteAnnualEur: 64800,
  },
  {
    year: 2006,
    westArbeitnehmerAnnualEur: 63000,
    westAngestellteAnnualEur: 77400,
    eastArbeitnehmerAnnualEur: 52800,
    eastAngestellteAnnualEur: 64800,
  },
  {
    year: 2007,
    westArbeitnehmerAnnualEur: 63000,
    westAngestellteAnnualEur: 77400,
    eastArbeitnehmerAnnualEur: 54600,
    eastAngestellteAnnualEur: 66600,
  },
  {
    year: 2008,
    westArbeitnehmerAnnualEur: 63600,
    westAngestellteAnnualEur: 78600,
    eastArbeitnehmerAnnualEur: 54000,
    eastAngestellteAnnualEur: 66600,
  },
  {
    year: 2009,
    westArbeitnehmerAnnualEur: 64800,
    westAngestellteAnnualEur: 79800,
    eastArbeitnehmerAnnualEur: 54600,
    eastAngestellteAnnualEur: 67200,
  },
  {
    year: 2010,
    westArbeitnehmerAnnualEur: 66000,
    westAngestellteAnnualEur: 81600,
    eastArbeitnehmerAnnualEur: 55800,
    eastAngestellteAnnualEur: 68400,
  },
  {
    year: 2011,
    westArbeitnehmerAnnualEur: 66000,
    westAngestellteAnnualEur: 81000,
    eastArbeitnehmerAnnualEur: 57600,
    eastAngestellteAnnualEur: 70800,
  },
  {
    year: 2012,
    westArbeitnehmerAnnualEur: 67200,
    westAngestellteAnnualEur: 82800,
    eastArbeitnehmerAnnualEur: 57600,
    eastAngestellteAnnualEur: 70800,
  },
  {
    year: 2013,
    westArbeitnehmerAnnualEur: 69600,
    westAngestellteAnnualEur: 85200,
    eastArbeitnehmerAnnualEur: 58800,
    eastAngestellteAnnualEur: 72600,
  },
  {
    year: 2014,
    westArbeitnehmerAnnualEur: 71400,
    westAngestellteAnnualEur: 87600,
    eastArbeitnehmerAnnualEur: 60000,
    eastAngestellteAnnualEur: 73800,
  },
  {
    year: 2015,
    westArbeitnehmerAnnualEur: 72600,
    westAngestellteAnnualEur: 89400,
    eastArbeitnehmerAnnualEur: 62400,
    eastAngestellteAnnualEur: 76200,
  },
  {
    year: 2016,
    westArbeitnehmerAnnualEur: 74400,
    westAngestellteAnnualEur: 91800,
    eastArbeitnehmerAnnualEur: 64800,
    eastAngestellteAnnualEur: 79800,
  },
  {
    year: 2017,
    westArbeitnehmerAnnualEur: 76200,
    westAngestellteAnnualEur: 94200,
    eastArbeitnehmerAnnualEur: 68400,
    eastAngestellteAnnualEur: 84000,
  },
  {
    year: 2018,
    westArbeitnehmerAnnualEur: 78000,
    westAngestellteAnnualEur: 96000,
    eastArbeitnehmerAnnualEur: 69600,
    eastAngestellteAnnualEur: 85800,
  },
  {
    year: 2019,
    westArbeitnehmerAnnualEur: 80400,
    westAngestellteAnnualEur: 98400,
    eastArbeitnehmerAnnualEur: 73800,
    eastAngestellteAnnualEur: 91200,
  },
  {
    year: 2020,
    westArbeitnehmerAnnualEur: 82800,
    westAngestellteAnnualEur: 101400,
    eastArbeitnehmerAnnualEur: 77400,
    eastAngestellteAnnualEur: 94800,
  },
  {
    year: 2021,
    westArbeitnehmerAnnualEur: 85200,
    westAngestellteAnnualEur: 104400,
    eastArbeitnehmerAnnualEur: 80400,
    eastAngestellteAnnualEur: 99000,
  },
  {
    year: 2022,
    westArbeitnehmerAnnualEur: 84600,
    westAngestellteAnnualEur: 103800,
    eastArbeitnehmerAnnualEur: 81000,
    eastAngestellteAnnualEur: 100200,
  },
  {
    year: 2023,
    westArbeitnehmerAnnualEur: 87600,
    westAngestellteAnnualEur: 107400,
    eastArbeitnehmerAnnualEur: 85200,
    eastAngestellteAnnualEur: 104400,
  },
  {
    year: 2024,
    westArbeitnehmerAnnualEur: 90600,
    westAngestellteAnnualEur: 111600,
    eastArbeitnehmerAnnualEur: 89400,
    eastAngestellteAnnualEur: 110400,
  },
  {
    year: 2025,
    westArbeitnehmerAnnualEur: 96600,
    westAngestellteAnnualEur: 118800,
    eastArbeitnehmerAnnualEur: 96600,
    eastAngestellteAnnualEur: 118800,
  },
  {
    year: 2026,
    westArbeitnehmerAnnualEur: 101400,
    westAngestellteAnnualEur: 124800,
    eastArbeitnehmerAnnualEur: 101400,
    eastAngestellteAnnualEur: 124800,
  },
];

const byYear: ReadonlyMap<number, BbgAnnualRow> = new Map(
  BBG_ANNUAL_TABLE.map((row) => [row.year, row]),
);

export function getBbgAnnualRow(year: number): BbgAnnualRow | undefined {
  return byYear.get(year);
}
