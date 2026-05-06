# Quality Gates

Last updated: 2026-05-06

This file defines the engineering and CI contract for BugSmasher.

Use this together with:
- `docs/ULTIMATE_10_10_PLAN.md` for roadmap sequencing
- `docs/PRODUCTION_HARDENING_CHECKLIST.md` for release/hardening gates
- `docs/TEST_STRATEGY.md` for test depth expectations
- `.github/workflows/ci.yml` for the currently implemented CI workflow

## Current Quality Status (Audit 2026-05-06)

**Overall Health: 4.5/10**
- **Build Status**: ❌ Failing (Tailwind dependency issues)
- **Tests**: ✅ 809 tests pass
- **Lint**: ⚠️ 541 errors (mostly temp files)
- **Coverage**: ⚠️ 41% (critical gaps in Renderer 0.2%, AuthManager 20%)
- **Security**: ✅ 0 vulnerabilities
- **Type Check**: ✅ Passes

## Canonical local commands

These commands are the authoritative local quality commands as defined in `package.json`.

| Command | Purpose | Current Status |
| --- | --- | --- |
| `npm run lint` | ESLint across the repository | ⚠️ 541 errors |
| `npm run typecheck` | TypeScript typecheck | ✅ Passes |
| `npm test -- --run` | Automated test suite | ✅ 809 tests pass |
| `npm run test:coverage` | Test suite with coverage | ⚠️ 41% coverage |
| `npm run build` | Production build | ❌ Failing |
| `npm audit --omit=dev` | Dependency vulnerability audit | ✅ 0 vulnerabilities |
| `npm run quality` | Combined local quality pipeline | ❌ Failing |

## Current CI reality

As of this update, `.github/workflows/ci.yml` runs:
- `npm ci`
- `npm run lint`
- `npm test -- --run`
- `npm run build`

**Audit Finding**: CI will fail due to current build issues. The following are still target-state requirements rather than current CI truth:
- `npm run typecheck`
- `npm run test:coverage`
- `npm audit --omit=dev`
- stronger secret scan enforcement

Docs must not claim those CI checks are already enforced until the workflow is updated.

## Gate categories

## 1. Static analysis

### Required for strong quality claims
- ESLint passes
- TypeScript typecheck passes
- Any repo-wide lint suppression or config exceptions are intentional and documented

### Notes
- Passing ESLint alone is not sufficient if type errors are still possible.
- Repo-wide lint health must be credible, not limited to only recently touched files.

## 2. Automated tests

### Required
- `npm test -- --run` passes
- high-risk flows are covered according to `docs/TEST_STRATEGY.md`

### Minimum expectation
Tests must go beyond happy-path unit checks for the following areas:
- auth flows
- save and resume behavior
- leaderboard and stats integrity
- degraded external-service behavior
- UI flow regressions for critical overlays and dialogs

## 3. Coverage

### Current repo thresholds
Current thresholds from `vitest.config.ts` are:
- statements: 29
- branches: 21
- functions: 38
- lines: 30

These are baseline thresholds, not 10/10 thresholds.

### 10/10 direction
A true 10/10 state requires stronger, risk-based thresholds and evidence, especially for:
- `src/game/database/AuthManager.ts`
- `src/game/database/CloudSaveManager.ts`
- `src/game/database/LeaderboardManager.ts`
- `src/game/database/StatsManager.ts`
- gameplay state transitions and resume behavior

## 4. Build and bundle health

### Required
- production build succeeds
- bundle warnings are understood and documented honestly
- performance expectations are tracked in living docs

### 10/10 direction
The project should eventually enforce:
- measured bundle budgets
- documented first-load path review
- deployment-level performance checks

## 5. Dependency and secret hygiene

### Required
- dependency audit passes or known exceptions are explicitly tracked
- secret scan passes for known markers in the current tree
- historical secret exposure is handled as part of the roadmap, not ignored

### Notes
A 10/10 claim requires both clean code and clean repository hygiene.

## 6. Accessibility and UX verification

### Required for 10/10
- keyboard-accessible critical flows
- visible focus
- accessible labels for controls
- dialog and overlay behavior that is testable and predictable

### Current stance
Accessibility is part of the required quality contract even if not fully automated yet.

## 7. Documentation truthfulness

A quality gate also applies to documentation.

### Required
- commands in docs match `package.json`
- CI claims in docs match `.github/workflows/ci.yml`
- public-facing docs avoid inflated quality claims
- feature claims are backed by `docs/FEATURE_TRUTH_MATRIX.md`

## Blocking vs advisory failures

## Blocking
These block strong release-quality claims:
- lint failure
- typecheck failure
- test failure
- build failure
- documented security blocker left unresolved without explicit disclosure
- docs contradicting code or CI reality

## Advisory until promoted to hard gates
These are still important but may be staged in:
- tighter coverage thresholds
- performance budget enforcement
- full browser-smoke automation
- deeper accessibility automation

## Definition of done for a true 10/10 gate contract

The quality contract is only complete when:
- the documented gates match the implemented CI workflow
- the high-risk modules have meaningful evidence, not just low aggregate coverage
- the release checklist and roadmap use the same gate definitions
- the repo does not overstate its automation maturity
