# AGENTS.md - `flex-internal-frontend`
Repoet `flex-internal-frontend` er et internt Next.js-verktøy for NAV-ansatte for oppslag og feilsøking i Flex-data (sykmeldinger, søknader, inntektsmeldinger, arbeidssøkerperioder m.m.).

## 1) Kommandoer

Bruk IntelliJ MCP (`execute_run_configuration`) for scripts — se **`AGENTS-intellij.md`**. Scripts for referanse:

```sh
pnpm run dev # kjør lokalt med mock-backend på port 8080
pnpm run local # kjør lokalt med LOCAL_BACKEND=true og MOCK_BACKEND=true
pnpm run test # kjør Vitest i CI-modus (ingen watch)
pnpm run test:watch # kjør Vitest i watch-modus
pnpm run build # bygg for produksjon
pnpm run format # kjør prettier + eslint --fix
pnpm run lint # kjør eslint
pnpm run prettier:check # sjekk formattering
```

- `pnpm run dev` bruker mock-backend lokalt (`MOCK_BACKEND=true`)

### Før commit (obligatorisk)

Kjør i rekkefølge via `execute_run_configuration`:

1. `format`
2. `test`
3. `build`

## 2) Testing

- Enhet/integrasjon: **Vitest** (`.test.ts` / `.test.tsx`) i `src/`
- E2E: Ikke satt opp som standard script i dette repoet per nå
- «Kjør tester» betyr `pnpm run test` med mindre noe annet er eksplisitt avtalt
- Prioriter tester for endret domenelogikk

## 3) Prosjektstruktur

- Sider og API-ruter: `src/pages/` (`*.tsx`, `pages/api/**`)
- UI: `src/components/`
- Datahenting/server state: `src/queryhooks/` (React Query + egne hooks)
- Hjelpefunksjoner: `src/utils/`
- Mock-data i dev: `src/testdata/`

Ved nytt backend-endepunkt:
1. Opprett rute i `src/pages/api/{backend}/[[...path]].ts`
2. Oppdater `tillatteApier`
3. Behold `beskyttetApi()` + `proxyKallTilBackend()`
4. Hent data fra queryhook med `useQuery()` + `fetchJsonMedRequestId()`

## 4) Kodestil

- All kode, kommentarer og UI-tekst på **norsk bokmål**
- Bruk eksisterende mønstre i koden fremfor nye varianter
- Bruk props-basert dataflyt og hooks (ingen Redux/Zustand)
- Dato-strenger skal håndteres via `src/utils/dato.ts` (f.eks. `datostrengTilUtcDato`)
- Bruk `fetchJsonMedRequestId()` for kall som skal spores med request-id

## 5) Git-workflow

- Egen branch per feature/fix, aldri direkte på `main`
- Hold commit-meldinger korte, beskrivende, én linje, uten punktum
- Ingen conventional commit-prefix og ingen issue-nummer påkrevd

Standard flyt:

```sh
git checkout -b kort-beskrivende-navn
# kjør format, test og build via IntelliJ MCP (se «Før commit» i seksjon 1)
git commit -m "Kort beskrivelse på norsk"
git push origin <branch>
```

Opprett PR via GitHub MCP (`create_pull_request`) eller `gh pr create --fill`.

## 6) Grenser (aldri gjør dette)

- Aldri lekke eller logge sensitiv informasjon (fnr, tokens, session-data)
- Aldri hardkode hemmeligheter eller credentials
- Aldri bytt ut datohåndtering i `src/utils/dato.ts` med tilfeldige ad hoc-varianter
- Aldri innfør ny global state-løsning uten eksplisitt beskjed
- Aldri kall backend direkte fra tilfeldige komponenter når queryhook/API-mønster finnes
- Aldri fjern sikkerhetsmekanismer i API-ruter (`beskyttetApi`, whitelist)
- Aldri commit med rød format/test/build

## Når du trenger mer kontekst

- `README.md` - prosjektformål og lokal kjøring
- `package.json` - scripts og verktøy som faktisk brukes
- `src/utils/environment.ts` - miljødeteksjon (`isProd()`, `isMockBackend()`)
- `src/pages/api/**/*.ts` - API-proxy, whitelist og sikkerhetsmønstre
- `src/queryhooks/` - anbefalt mønster for datahenting
- `src/utils/dato.ts` - korrekt håndtering av dato-strenger
- `src/proxy/backendproxy.ts` - proxying og validering av tillatte API-kall

## Hurtigsjekk før levering

- [ ] Endringen følger eksisterende mønster i berørte filer
- [ ] Tester er oppdatert der domenelogikk er endret
- [ ] Format, tester og bygg er grønn (se «Før commit» i seksjon 1)
