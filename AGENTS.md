# AGENTS.md

Guide for AI coding agents working on `flex-internal-frontend`.

## Project Overview

**flex-internal-frontend** is a Next.js-based internal NAV administration tool for examining Flex-related worker data (sick leave applications, work history, income statements, etc.). It's a diagnostic/debugging dashboard restricted to NAV staff with AD group membership, requiring NaisDevice access.

**Tech Stack:**
- Next.js 16 (TypeScript, React 19)
- TailwindCSS 4 with Aksel (NAV design system)
- React Query 5 (@tanstack/react-query)
- pnpm package manager (Node 24+)
- Vitest for testing

## Code Language

**All code is written in Norwegian Bokmål.** Variable names, function names, comments, and UI text use Norwegian. This is non-negotiable. Examples:
- `soknader` (applications), `fnr` (national ID), `arbeidsgiver` (employer)
- `datostrengTilUtcDato` (date string to UTC date)
- Comments like `// Konverter søknad til fnr`

Keep comments minimal—code should be self-explanatory.

## Architecture

### Multi-Backend Proxy Pattern

The app proxies requests to multiple NAV backends through Next.js API routes. The pattern is:

1. **Page/Component** → calls query hook → **Client-side fetch** to `/api/{backend-name}/**`
2. **API Route** (`/api/{backend-name}/[[...path]].ts`) → validates allowed endpoints → proxies to actual backend
3. **Backend** → returns data, proxied back through API route

Key files:
- `/src/proxy/backendproxy.ts` — Core proxy logic with `proxyKallTilBackend()` and `validerKall()`
- `/src/pages/api/sykepengesoknad-backend/[[...path]].ts` — Example API endpoint
- `/src/auth/beskyttetApi.ts` — Auth wrapper (Azure token validation)
- `/src/auth/beskyttetSide.ts` — Server-side page protection (getServerSideProps)

Each backend route has a **whitelist** of allowed endpoints (`tillatteApier`). Unauthorized requests return 404. Request IDs track calls for metrics/debugging.

### Query Hooks Pattern

All data fetching uses React Query with custom hooks in `/src/queryhooks/`. Examples:
- `useAareg()` — POST to `/api/sykepengesoknad-backend/api/v1/flex/aareg`
- `useSoknader()` — Fetches sick leave applications
- `useSykmeldinger()` — Fetches sickness certificates

Hooks use `fetchJsonMedRequestId()` from `/src/utils/fetch.ts`, which auto-adds `x-request-id` headers for tracing.

### Component Hierarchy

Pages are in `/src/pages/`, components in `/src/components/`:

```
index.tsx (main page)
  └─ Tidslinje (timeline component)
    ├─ Filter (chip-based filtering by properties)
    ├─ ValgtArbeidsgiver (employer selector dropdown)
    ├─ TidslinjeArbeidsgiver (employer timeline)
    └─ TidslinjeSykmelding (sickness certificate timeline)
```

Components use **local state** via `useState` for UI state (selected employer, active filters). Timeline components display data grouped and sorted by employer and date range.

### Environment & Mock Backend

Three execution modes:

- **`pnpm run dev`** → `MOCK_BACKEND=true` — Local dev with fake data from `/src/testdata/testdata.ts`
- **`pnpm run local`** → `LOCAL_BACKEND=true MOCK_BACKEND=true` — Mock backend but local config
- **`pnpm run start`** → Production mode, hits real backends

Check `/src/utils/environment.ts` for runtime environment detection (`isProd()`, `isMockBackend()`, etc.).

When `isMockBackend()` is true, API routes call `mockApi()` instead of proxying. Mock responses are stored in testdata.

## Key Patterns & Conventions

### Date Handling

- Use `/src/utils/dato.ts` utilities:
  - `datostrengTilUtcDato(string)` — Parse ISO date strings to UTC Date objects
  - `dagerMellomUtcDatoer(Date, Date)` — Calculate days between dates
  - Avoid timezone complications by always working with UTC

### Fetch & Error Handling

- `fetchMedRequestId()` returns `{ requestId, response }` with UUID tracking
- `fetchJsonMedRequestId()` wraps `fetchMedRequestId()` and returns parsed JSON (`T`)
- Always include request IDs for backend correlation

### Validation

- Input validation in `/src/utils/inputValidering.ts` (e.g., `handterFnrValidering()` for national ID fields)
- API routes use `validerKall()` to whitelist endpoints; invalid calls return 404 silently

### Filtering & Grouping

- `/src/utils/filterlogikk.ts` and `/src/utils/gruppering.ts` define shared data transformation logic
- Filters are objects: `{ prop: string; verdi: string; inkluder: boolean }`
- Filter state managed in parent component; child components receive filtered data

### Overlapping Timeline Logic

- `/src/utils/overlapp.ts` detects overlapping time periods (for applications covering same date ranges)
- Used to display conflict indicators in timeline components

## Build & Testing

**Scripts:**

```sh
pnpm run dev              # Local dev with mock backend (port 8080)
pnpm run build            # Production build
pnpm run start            # Run production build
pnpm run test             # Run vitest suite
pnpm run test:watch       # Watch mode for tests
pnpm run prettier:write   # Write prettier formatting
pnpm run lint             # ESLint check (TS/TSX)
pnpm run lint:fix         # Auto-fix linting issues
pnpm run format           # Prettier + ESLint fixes
pnpm run prettier:check   # Check formatting
```

**Note:** Tests use Vitest (ESM-compatible alternative to Jest). Test file convention: `.test.ts` suffix. Example: `/src/utils/sykmeldingValidering.test.ts`.

**Before every commit:** always run `pnpm run format && pnpm run build` to fix formatting and verify the build compiles. Remove unused imports and dead code before committing.

## Styling

- **TailwindCSS 4** with Aksel (NAV design system) components
- Aksel components: `@navikt/ds-react` (Button, Search, Dropdown, InternalHeader, etc.)
- Aksel icons: `@navikt/aksel-icons`
- Custom CSS in `/src/style/global.css` (minimal—prefer Tailwind utilities)
- Prettier plugin `prettier-plugin-tailwindcss` auto-sorts class names

## Authentication & Security

- **Azure AD** integration via `@navikt/oasis` library
- API routes: `getToken()` + `validateAzureToken()` in `beskyttetApi()`
- SSR pages: `getToken()` + `validateAzureToken()` in `beskyttetSide()`
- Mock backend bypasses all auth (useful for local dev)
- Allowed AD group: `team flex` (enforced outside app, at ingress level)

## Cross-Component Communication

- **Props-based** data flow (no Redux/Zustand)
- Timeline components receive `soknader` (applications) and `klipp` (clipped/overlapping records) as arrays
- Parent components handle filtering and grouping; pass filtered data to children
- Query hooks centralize all backend communication

## File Organization

```
/src
  /pages                 → Next.js routes (pages + API endpoints)
  /pages/api/{backend}   → Proxy routes (one per backend)
  /pages/api/internal    → Health/probe endpoints (`isAlive`, `isReady`, `preStop`)
  /components            → React components (mostly presentational)
  /queryhooks            → React Query hooks (data fetching)
  /auth                  → Auth logic (Azure token validation)
  /proxy                 → Backend proxy utilities
  /utils                 → Shared utilities (date, fetch, validation, filtering)
  /testdata              → Mock data for local dev
  /initialprops          → Server-side props shared across pages
  /style                 → Global CSS
```

## Common Tasks

### Adding a New Backend Endpoint

1. Create API route at `/src/pages/api/{backend-name}/[[...path]].ts` (copy existing pattern)
2. Add allowed endpoints to `tillatteApier` array
3. Import `beskyttetApi()` wrapper and proxy handler
4. Create query hook in `/src/queryhooks/use{Name}.ts` with `useQuery()` + `fetchJsonMedRequestId()`

### Adding a New Page

1. Create `.tsx` file in `/src/pages/{name}.tsx`
2. Import `initialProps` from `/src/initialprops/initialProps.ts`
3. Export `getServerSideProps = initialProps` for auth
4. Use query hooks to fetch data in component
5. Add page metadata to `/src/pages/_app.tsx` `sider` object for navigation

### Modifying Timeline Data Flow

- Update filter/grouping logic in `/src/utils/filterlogikk.ts` or `/src/utils/gruppering.ts`
- Timeline component state in `/src/components/Tidslinje.tsx` recomputes on filter changes via `useEffect`

## Deployment & Environment

- **Nais** deployment (NAV Kubernetes platform)
- Config in `/nais/app/` (dev.yaml, prod.yaml, naiserator.yaml)
- Docker image built from Dockerfile (standalone Next.js)
- Prod: `https://flex-internal.intern.nav.no/`
- Dev: `https://flex-internal.intern.dev.nav.no/`

## Code Review Checklist

- [ ] All variable names and comments in Norwegian Bokmål
- [ ] API whitelist updated if adding new endpoints
- [ ] Request IDs used in fetches (automatic via `fetchJsonMedRequestId`)
- [ ] Filters/grouping logic tested with edge cases (empty data, overlaps)
- [ ] Mock data in testdata.ts matches real backend response shape
- [ ] Environment checks (`isMockBackend()`, `isProd()`) properly used
- [ ] Tailwind class names sorted (prettier plugin handles this)
- [ ] No explicit return type annotations on short arrow functions (ESLint disables it)

## Commit Message Style

Keep commit messages short and in Norwegian, matching the style of recent commits. Examples:

```
Vis OPPHOLD_UTLAND-søknader som pin i tidslinjen
Viser tydeligere viktige felter
Vis meldingtilnavdager
```

## Contact

Questions about code/architecture: `flex@nav.no` or Slack `#flex`

