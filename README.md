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
| `vitest.config.ts`        | Testkonfiguration (Vitest)                                       |

## Datenbank (optional)

`DATABASE_URL` setzen, dann:

```bash
npm run db:generate
npm run db:push
```

## Vercel (404 / leere Seite)

1. **Production-Branch:** Unter *Project → Settings → Git* muss der Branch ausgewählt sein, auf dem **`package.json`** und **`next.config.ts`** liegen (meist `main`). Wenn der Next-Code nur auf einem Feature-Branch liegt und nicht gemergt ist, liefert die `.vercel.app`-URL oft **keine gültige App**.
2. **Letztes Deployment öffnen:** *Deployments* → neuesten Eintrag wählen → **Visit** (nicht eine alte Lesezeichen-URL). Die generische Meldung **404 NOT_FOUND** mit `fra1::…` kommt häufig, wenn **kein erfolgreiches Deployment** an diese Domain gebunden ist.
3. **Build-Logs:** Derselbe Deployment-Eintrag → *Building* / *Logs*. Rot = Build fehlgeschlagen (z. B. Node-Version, fehlende Env) — dann gibt es oft **kein** lauffähiges Output.
4. **Umgebungsvariablen:** Für `/api/extract` mindestens **`ANTHROPIC_API_KEY`** unter *Settings → Environment Variables* (für **Production** und ggf. **Preview**) setzen und **neu deployen**.
5. **Root Directory:** Unter *Settings → General* leer bzw. `.` — nur setzen, wenn die App in einem **Unterordner** des Repos liegt.

Der Build-Befehl im Repo ist **`npm run build`** (`next build` ohne Turbopack) für maximale Kompatibilität mit dem Vercel-Builder.

## Hinweise

- Keine echte Kunden-VO ohne Freigabe; POC mit synthetischen oder anonymisierten Dokumenten.
- Modell-ID über `ANTHROPIC_MODEL` steuerbar (siehe Anthropic-Dokumentation).
