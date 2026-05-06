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

## Projektstruktur (Auszug)

| Pfad                     | Inhalt                                                           |
| ------------------------ | ---------------------------------------------------------------- |
| `src/lib/schema/`        | Zod-Schema und Typen                                             |
| `src/lib/extraction/`    | Systemprompt, Anthropic-Orchestrierung                           |
| `src/lib/documents/`     | PDF (`pdf-parse` / `PDFParse`), DOCX (`mammoth`)                 |
| `src/app/api/extract/`   | POST `multipart/form-data` mit Feld `file`                       |
| `src/db/schema.ts`       | Drizzle-Tabellenstubs (Projekte, Dokumente, Extraktionen, Audit) |
| `scripts/extract-cli.ts` | Kommandozeilen-Extraktion                                        |

## Datenbank (optional)

`DATABASE_URL` setzen, dann:

```bash
npm run db:generate
npm run db:push
```

## Hinweise

- Keine echte Kunden-VO ohne Freigabe; POC mit synthetischen oder anonymisierten Dokumenten.
- Modell-ID über `ANTHROPIC_MODEL` steuerbar (siehe Anthropic-Dokumentation).
