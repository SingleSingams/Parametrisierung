# bAV-Parametrisierungs-Assistent (POC)

Proof-of-Concept für KI-gestützte Analyse von Versorgungsordnungen (BoLZ, Direktzusage): Textextraktion aus PDF/DOCX, strukturierte Parameter-Extraktion über die Anthropic API, Validierung mit **Zod** (`BoLZ_Direktzusage_v1`).

## Voraussetzungen

- Node.js 20+
- `ANTHROPIC_API_KEY` (siehe `.env.example`)

## Schnellstart

```bash
cp .env.example .env
# ANTHROPIC_API_KEY eintragen

npm install
npm run dev
```

Web-UI: Upload unter `http://localhost:3000`.

## CLI (Woche-1-Ziel)

```bash
npm run extract -- pfad/zur/vo.pdf --out ergebnis.json
npm run extract -- vo.docx --dry-run   # nur Klartext-Vorschau
```

## Tests und Gold-Fixture

```bash
npm run test              # immer: Gold-JSON muss Zod erfüllen
ANTHROPIC_API_KEY=... npm run test   # zusätzlich: Integration gegen Anthropic
```

- Synthetische VO (Klartext): `tests/fixtures/synthetic-bolz-direktzusage/vo-muster-ag.txt`
- Handgepflegtes Soll-JSON: `tests/fixtures/synthetic-bolz-direktzusage/gold-extraction.json`
- Kernfeldvergleich (ohne Metadaten/Quellenwortlaut): `src/lib/validation/compare-critical-fields.ts`

## Projektstruktur (Auszug)

| Pfad                     | Inhalt                                                           |
| ------------------------ | ---------------------------------------------------------------- |
| `src/lib/schema/`        | Zod-Schema und Typen                                             |
| `src/lib/extraction/`    | Systemprompt, Anthropic-Orchestrierung                           |
| `src/lib/documents/`     | PDF (`pdf-parse` / `PDFParse`), DOCX (`mammoth`)                 |
| `src/app/api/extract/`   | POST `multipart/form-data` mit Feld `file`                       |
| `src/db/schema.ts`       | Drizzle-Tabellenstubs (Projekte, Dokumente, Extraktionen, Audit) |
| `scripts/extract-cli.ts` | Kommandozeilen-Extraktion                                        |
| `src/lib/validation/`    | Kernfeldvergleich Extraktion ↔ Gold                              |
| `tests/fixtures/...`     | Synthetische VO + Gold-JSON                                      |
| `vitest.config.ts`       | Testkonfiguration (Vitest)                                       |

## Datenbank (optional)

`DATABASE_URL` setzen, dann:

```bash
npm run db:generate
npm run db:push
```

## Hinweise

- Keine echte Kunden-VO ohne Freigabe; POC mit synthetischen oder anonymisierten Dokumenten.
- Modell-ID über `ANTHROPIC_MODEL` steuerbar (siehe Anthropic-Dokumentation).
