# BugSmasher by HopeTheory

Wave-based arcade clicker defense game built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

Live demo: https://bugsmasher-ten.vercel.app

## Honest Status

Current local rating after the April 29, 2026 audit: **6.6/10**.

The core game loop is solid for a portfolio game, but the project is not yet 10/10. The main gaps are security cleanup, real linting, deeper tests, feature-claim verification, bundle governance, CI, and documentation discipline.

## What Works

- Wave-based click defense gameplay
- Object-oriented game engine with pooled entities
- Powerups, upgrades, combo scoring, prestige hooks, biomes, achievements, and challenge systems
- Offline-first local saves
- Supabase-backed auth/profile/stat/leaderboard/cloud-save managers
- Vitest coverage gate now available through `npm run test:coverage`
- Production build passes locally

## Known Risks

- Historical Supabase credentials were committed and must be rotated in the Supabase dashboard.
- Public git history still needs secret scrubbing before this repository is promoted.
- `npm run lint` is currently TypeScript-only, not ESLint.
- Test coverage is low overall: about 25% statements and 16% branches in the latest local run.
- Premium and rewarded-ad systems are local/demo logic, not real payment or ad-provider integrations.
- Build emits a large main chunk warning.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Required `.env` values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is for local admin scripts only. Never expose it with a `VITE_` prefix.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local dev server |
| `npm run typecheck` | Run TypeScript check |
| `npm run lint` | Current lint gate: TypeScript check only |
| `npm test` | Run Vitest suite |
| `npm run test:coverage` | Run Vitest with coverage |
| `npm run build` | Production build |

## Audit Artifacts

- [Merged audit and taskboard](docs/BUGSMASHER_AUDIT_2026-04-29.md)
- [Database notes](DATABASE.md)

## License

MIT (see `LICENSE`).
