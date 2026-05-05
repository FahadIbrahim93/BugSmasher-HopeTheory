# BugSmasher Ultimate 10/10 Plan

Date: 2026-04-29

## 1. Definition Of 10/10

BugSmasher is 10/10 only when it is safe to show clients, stable under real usage, honest in public claims, and enforceable by CI.

Required proof:

1. Security: no committed secrets, rotated leaked keys, clean dependency audit, RLS verified, no service-role key in browser bundle.
2. Reliability: guest play, auth, cloud sync, leaderboard, and local fallback have tested success and failure paths.
3. Quality gates: lint, typecheck, unit/integration tests, coverage, build, audit, and secret scan run in CI.
4. Coverage: high-risk modules have branch tests, not just superficial aggregate coverage.
5. Performance: no oversized ungoverned bundles; budgets enforce the limit.
6. Accessibility: WCAG 2.2 AA basics verified for keyboard, focus, target size, labels, and auth flows.
7. Product truth: premium/ad/social claims either work with real providers or are clearly labeled demo/local.
8. Operations: rollback, monitoring, incident response, and release checklist exist.

## 2. Research Baseline

- OWASP ASVS 5.0 is the security yardstick for web app controls.
- WCAG 2.2 is the current W3C accessibility recommendation and adds focus, touch target, redundant-entry, and accessible-auth criteria.
- Core Web Vitals define good field thresholds as LCP <= 2.5s, INP <= 200ms, and CLS <= 0.1 at the 75th percentile.
- GitHub Actions plus npm audit and a secret hygiene scan make the local quality contract repeatable.

## 3. Current State

Strengths:

1. Real playable game loop with waves, upgrades, powerups, and a canvas renderer.
2. Offline-first persistence is the right product shape for a browser arcade game.
3. Supabase manager boundaries exist and can be tested.

Critical gaps:

1. Leaked keys require dashboard rotation and git-history cleanup.
2. Tests cover only a narrow game-engine slice.
3. Premium and rewarded ads are local/demo mechanics.
4. Main build chunk exceeds Vite's default warning budget.
5. CI and linting were absent before this sweep.

## 4. Architecture Target

Keep the game simple:

1. `src/game/*`: deterministic domain/game systems.
2. `src/game/database/*`: persistence adapters and data sync.
3. `src/components/*`: React presentation and user flow.
4. `src/lib/*`: future shared utilities for telemetry, error taxonomy, and feature flags.

Do not introduce a backend unless needed for payments, anti-cheat, or admin-only operations.

## 5. Execution Phases

### Phase 0 - Stop The Bleeding

- Remove committed secrets.
- Rotate leaked keys.
- Scrub git history.
- Add CI secret scan.

### Phase 1 - Make Gates Real

- Real ESLint and typecheck as separate commands.
- Coverage command with thresholds.
- CI quality workflow.
- Dependency audit.

### Phase 2 - Test Risk Paths

- Config and unconfigured Supabase behavior.
- Save/load corrupt localStorage cases.
- Auth success/failure paths with mocked Supabase.
- Cloud save and leaderboard failure handling.
- Game engine wave/powerup/base damage.

### Phase 3 - Product Truth

- Audit every README feature claim against code.
- Mark demo-only monetization honestly.
- Remove inflated historical quality claims.

### Phase 4 - Production UX

- Bundle split and budget check.
- Accessibility smoke checklist and automated linting.
- Offline/cloud degraded-mode messaging.

### Phase 5 - Operations

- Release checklist.
- Rollback checklist.
- Monitoring events for auth, cloud save, leaderboard, and fatal UI errors.

## 6. Acceptance Criteria

The sweep is complete when:

1. `npm run quality` passes locally.
2. `npm audit --omit=dev` returns zero vulnerabilities.
3. Secret scan returns no matches for known leaked markers.
4. Docs reflect real state.
5. External blockers are explicitly listed with owners and exact next action.
