# BugSmasher Logbook

## 2026-04-29

### SEC-001

Summary: Removed committed Supabase fallback credentials from app config and converted admin scripts to environment variables.

Files: `.env.example`, `src/game/database/supabaseConfig.ts`, `config-auth.mjs`, `setup-db.mjs`, `setup-google-oauth.mjs`.

Verification: `rg` scan for known leaked markers returned no matches outside excluded local/generated folders.

Residual risk: Supabase dashboard key rotation and git-history scrubbing still require external action.

### QG-002

Summary: Added GitHub Actions quality workflow.

Files: `.github/workflows/ci.yml`.

Verification: Local equivalent commands are executed during the sweep.

Residual risk: Remote GitHub workflow must run after push.

### DOC-001

Summary: Replaced public 10/10 claims with evidence-backed status and added 10/10 plan/taskboard.

Files: `README.md`, `TASKS_10_10.md`, `docs/BUGSMASHER_AUDIT_2026-04-29.md`, `docs/ULTIMATE_10_10_PLAN.md`, `docs/AGENTS_AND_TASKBOARD.md`.

Verification: Docs contain explicit blockers and gate definitions.

### QG-001

Summary: Installed and configured ESLint 9 with TypeScript, React Hooks, React Refresh, and JSX accessibility checks.

Files: `package.json`, `package-lock.json`, `eslint.config.js`.

Verification: `npm run lint` exits 0.

Residual risk: Legacy `any` and console diagnostics remain allowed pending a later structured-logging refactor.

### TEST-001

Summary: Added focused tests for save persistence/corruption, premium state, ad callbacks, biome unlocks, leaderboard ranking, and Supabase config source hygiene.

Files: `src/game/*.test.ts`, `src/game/database/supabaseConfig.test.ts`.

Verification: `npm test -- --run` reports 7 files and 30 tests passing.

Residual risk: AuthManager, CloudSaveManager, LeaderboardManager, and UI flows still need deeper branch/integration coverage.

### TEST-002

Summary: Added more branch tests for prestige/daily-challenge save logic, corrupt premium state, alternate ad-provider flows, and uncovered a real ad state bug.

Files: `src/game/SaveManager.test.ts`, `src/game/PremiumManager.test.ts`, `src/game/AdManager.test.ts`, `src/game/AdManager.ts`.

Verification: `npm run test:coverage` reports 30 tests passing and coverage above enforced thresholds.

Residual risk: Database-backed managers are still the lowest-coverage area.

### PERF-001

Summary: Added manual Vite chunks for React, Supabase, Motion, icons, and generic vendor code.

Files: `vite.config.ts`.

Verification: `npm run build` emits app chunk 153.33 kB and vendor chunks 10.02-211.53 kB with no >500 kB warning.

Residual risk: Field Core Web Vitals still need deployment measurement.

### SWEEP-001

Summary: Ran the complete local quality gate.

Verification: `npm run quality` exits 0: lint, typecheck, tests, coverage, build, audit all pass.

Residual risk: External key rotation and git-history scrubbing remain blocked outside local code execution.
