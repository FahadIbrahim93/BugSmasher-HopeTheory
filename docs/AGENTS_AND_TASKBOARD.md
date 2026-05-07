# BugSmasher AGENTS And Taskboard

## Agent Roles

### Coordinator

Owns sequencing, risk triage, and final evidence collection.

### Architect

Owns module boundaries, standards, acceptance criteria, and tradeoff decisions.

### Implementation

Owns code changes, tests, CI, and documentation updates.

### QA

Owns test matrix, edge cases, coverage, accessibility checks, and verification evidence.

### Security

Owns secret handling, dependency audit, RLS checks, auth flow review, and release blocking security issues.

## Coding Standards

1. Keep game systems deterministic where possible.
2. Do not put service-role credentials in browser code or `VITE_` variables.
3. Prefer explicit failure states over silent fallback.
4. Every feature claim needs code evidence or must be labeled demo/local.
5. New shared behavior needs tests before being called production-ready.

## Taskboard

| ID       | Priority | Task                                         | Owner          | Status           | Acceptance Criteria                                                                                  |
| -------- | -------- | -------------------------------------------- | -------------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| SEC-001  | P0       | Remove committed secrets from current tree   | Security       | Done             | Secret scan has no known leaked markers                                                              |
| SEC-002  | P0       | Rotate Supabase leaked keys                  | Security/User  | Blocked external | New anon/service keys deployed; old keys revoked                                                     |
| SEC-003  | P0       | Scrub git history                            | Security/User  | Blocked approval | Clean history scan after BFG/filter-repo                                                             |
| QG-001   | P0       | Add real ESLint gate                         | Implementation | Done             | `npm run lint` executes ESLint and exits 0                                                           |
| QG-002   | P0       | Add CI quality workflow                      | Implementation | Done             | `.github/workflows/ci.yml` runs install/lint/typecheck/test/coverage/build/audit                     |
| QG-003   | P1       | Add coverage gate                            | QA             | Done             | Coverage command executes with thresholds                                                            |
| TEST-001 | P1       | Expand config/storage tests                  | QA             | Done             | 30 tests pass across game/config/storage systems                                                     |
| PERF-001 | P1       | Split main bundle                            | Implementation | Done             | Build has no >500KB chunk warning                                                                    |
| DOC-001  | P0       | Replace inflated docs                        | Coordinator    | Done             | README/taskboard/audit state honest rating                                                           |
| OPS-001  | P2       | Add release/rollback checklist               | Architect      | Done             | Production checklist exists and maps to gates                                                        |
| BOSS-001 | P0       | Boss engine skeleton and Ant Queen encounter | Implementation | Done             | Wave 5 boss spawns, phases, damages core, spawns adds, grants rewards, completes wave, and has tests |
| BOSS-002 | P0       | Boss victory/defeat share cards              | Implementation | Done             | Boss metadata reaches game over UI and share card text/image payloads with automated tests           |

## Logbook Protocol

Each log entry must include:

1. Date/time.
2. Task ID.
3. Summary.
4. Files changed.
5. Verification command and result.
6. Residual risk or blocker.

## Logbook

| Date/time  | Task ID  | Summary                                                                                                                                     | Files changed                                                                                                                                                                                                                | Verification                                                                                                                                           | Residual risk/blocker                                                                |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| 2026-05-07 | BOSS-001 | Implemented first production boss slice: Motherboard Myrmex config, BossManager lifecycle, rendering, persistence, achievements, and tests. | `src/game/BossConfig.ts`, `src/game/BossManager.ts`, `src/game/GameEngine.ts`, `src/game/WaveManager.ts`, `src/game/Renderer.ts`, `src/game/SaveManager.ts`, `src/game/AchievementSystem.ts`, `src/game/BossManager.test.ts` | `npm test -- --run src/game/BossManager.test.ts src/game/GameEngine.test.ts`; full suite run executed after implementation.                            | Remaining boss roster is intentionally staged after first boss system validation.    |
| 2026-05-07 | BOSS-002 | Implemented boss-aware victory/defeat share card metadata and Game Over badge plumbing.                                                     | `src/game/DeathCardGenerator.ts`, `src/game/DeathCardGenerator.test.ts`, `src/components/Game.tsx`, `src/components/GameOver.tsx`, `src/game/GameEngine.ts`, `src/game/BossManager.ts`                                       | `npm test -- --run src/game/DeathCardGenerator.test.ts src/game/BossManager.test.ts src/game/GameEngine.test.ts`; build executed after implementation. | Visual screenshot still depends on unavailable browser automation in this container. |
