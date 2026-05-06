# bAV-Parametrisierungs-Assistent (POC)

Proof-of-Concept für KI-gestützte Analyse von Versorgungsordnungen (BoLZ, Direktzusage): Textextraktion aus PDF/DOCX/TXT, strukturierte Parameter-Extraktion über die Anthropic API, Validierung mit **Zod** (`BoLZ_Direktzusage_v1`).

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
npm run extract -- public/demo-vo.txt --out demo.json   # Demo ohne eigene VO
```

Auf der Web-UI: feste Demo-Datei unter **`/demo-vo.txt`** (herunterladen und wieder als `.txt` hochladen).

## Tests und Gold-Fixture

```bash
npm run test              # immer: Gold-JSON muss Zod erfüllen
ANTHROPIC_API_KEY=... npm run test   # zusätzlich: Integration gegen Anthropic
```

- Synthetische VO (Klartext): `tests/fixtures/synthetic-bolz-direktzusage/vo-muster-ag.txt`
- Handgepflegtes Soll-JSON: `tests/fixtures/synthetic-bolz-direktzusage/gold-extraction.json`
- Kernfeldvergleich (ohne Metadaten/Quellenwortlaut): `src/lib/validation/compare-critical-fields.ts`

## Reference Data (BBG)

- Tabelle **1990–2026** in `src/lib/reference-data/bbg-table.ts` (Arbeitnehmer/Angestellte, West laut SGB VI Anlage 2, Ost/Beitrittsgebiet laut Anlage 2a; ab 2025 einheitliche Regionalwerte).
- Abfrage: `getBbgRentenversicherungAnnualEur(jahr, "west" | "east", "arbeitnehmer" | "angestellte")` in `src/lib/reference-data/bbg-service.ts`.
- **Rechnungszins**: Platzhalter `getRechnungszinsStub()` in `src/lib/reference-data/rechnungszins-stub.ts` (echte Historie später).

## Berechnungs-Engine (Skelett)

Deterministische Hilfsfunktionen unter `src/lib/calculation/`:

- `accumulateEmployerContributionsBbgCapped` — Arbeitgeberanteil auf BBG-gekapptem Brutto je Jahr.
- `calculateOldAgeBenefitSkeleton`, `calculateDisabilityBenefitSkeleton`, `calculateDeathBenefitsSkeleton`, `calculateEarlyExitWithVestingSkeleton` — lineare Aufzinsung, einfache Vorzeit-Kürzung, Hinterbliebenen-Split (ohne Biometrie/Heubeck).

**Hinweis:** Mathematisch bewusst vereinfacht; dient UI-Erklärpfad und Tests, nicht der versicherungsmathematischen Schlussprüfung.

## Projektstruktur (Auszug)

| Pfad                      | Inhalt                                                           |
| ------------------------- | ---------------------------------------------------------------- |
| `src/lib/schema/`         | Zod-Schema und Typen                                             |
| `src/lib/extraction/`     | Systemprompt, Anthropic-Orchestrierung                           |
| `src/lib/reference-data/` | BBG-Tabelle (SGB VI), Rechnungszins-Stub                         |
| `src/lib/calculation/`    | Beitragssumme, Alters-/Invaliditäts-/Tod-/Ausscheiden-Skelett    |
| `src/app/api/extract/`    | POST `multipart/form-data` mit Feld `file`                       |
| `src/db/schema.ts`        | Drizzle-Tabellenstubs (Projekte, Dokumente, Extraktionen, Audit) |
| `scripts/extract-cli.ts`  | Kommandozeilen-Extraktion                                        |
| `src/lib/validation/`     | Kernfeldvergleich Extraktion ↔ Gold                              |
| `tests/fixtures/...`      | Synthetische VO + Gold-JSON                                      |
| `public/demo-vo.txt`      | Feste Demo-VO (TXT) zum Download und erneuten Upload             |

## Datenbank (optional)

`DATABASE_URL` setzen, dann:

```bash
npm run db:generate
npm run db:push
```

## Vercel (404 / leere Seite)

1. **Production-Branch:** Unter _Project → Settings → Git_ muss der Branch ausgewählt sein, auf dem **`package.json`** und **`next.config.ts`** liegen (meist `main`). Wenn der Next-Code nur auf einem Feature-Branch liegt und nicht gemergt ist, liefert die `.vercel.app`-URL oft **keine gültige App**.
2. **Letztes Deployment öffnen:** _Deployments_ → neuesten Eintrag wählen → **Visit** (nicht eine alte Lesezeichen-URL). Die generische Meldung **404 NOT_FOUND** mit `fra1::…` kommt häufig, wenn **kein erfolgreiches Deployment** an diese Domain gebunden ist.
3. **Build-Logs:** Derselbe Deployment-Eintrag → _Building_ / _Logs_. Rot = Build fehlgeschlagen (z. B. Node-Version, fehlende Env) — dann gibt es oft **kein** lauffähiges Output.
4. **Umgebungsvariablen:** Für `/api/extract` mindestens **`ANTHROPIC_API_KEY`** unter _Settings → Environment Variables_ (für **Production** und ggf. **Preview**) setzen und **neu deployen**.
5. **GitHub Actions:** Nach Merge auf `main` unter dem Tab **Actions** den Workflow **CI** öffnen — wenn **Build** dort grün ist, ist der Code in Ordnung; dann liegt das Problem nur noch in den **Vercel-Projekteinstellungen** (nicht im Repo).
6. **Vercel-Projekt neu anlegen:** Projekt in Vercel löschen, **Import** erneut ausführen, dabei **keine** Root Directory und **keine** Overrides setzen — oft schneller als endloses Debuggen alter Konfiguration.
7. Repo enthält **`vercel.json`** mit `framework: nextjs` und festem `buildCommand`/`installCommand` als zusätzliche Orientierung für den Builder.

Der Build-Befehl im Repo ist **`npm run build`** (`next build` ohne Turbopack) für maximale Kompatibilität mit dem Vercel-Builder.

## Hinweise

- Keine echte Kunden-VO ohne Freigabe; POC mit synthetischen oder anonymisierten Dokumenten.
- Modell-ID über `ANTHROPIC_MODEL` steuerbar (siehe Anthropic-Dokumentation).
