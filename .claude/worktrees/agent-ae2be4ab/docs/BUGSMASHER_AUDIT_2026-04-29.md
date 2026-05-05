# BugSmasher Audit And 10/10 Plan

Date: 2026-04-29

## Executive Verdict

Claude's report is mostly accurate. I would rate the project **6.6/10 after today's fixes**, not 10/10. Before today's fixes, 5.8/10 was fair because committed credentials and inflated documentation outweighed the good game-engine work.

The game itself has credible bones: a real engine, wave management, upgrades, local persistence, and Supabase-oriented managers. The repository maturity is behind the product ambition: security hygiene, test depth, CI, linting, bundle governance, and documentation honesty are not yet professional-grade.

## Evidence Checked Locally

| Gate | Result | Evidence |
| --- | --- | --- |
| Type/lint | Pass | `npm run lint` exits 0, but it only runs `tsc --noEmit` |
| Tests | Pass | `npm test -- --run`: 1 file, 9 tests |
| Coverage | Passes command | `npm run test:coverage` runs, but coverage is low: 25.31% statements, 16.64% branches |
| Build | Pass | `npm run build` exits 0 |
| Audit | Pass after fix | `npm audit --omit=dev` reports 0 vulnerabilities after `npm audit fix` |

## Claude Report Comparison

| Claude finding | Accuracy | My adjustment |
| --- | --- | --- |
| Exposed Supabase credentials | Correct | Worse than stated: service-role JWTs existed in admin scripts. Rotation and history scrub are mandatory. |
| Docs vs reality gap | Correct | Confirmed README/TASKS/SESSION claimed 10/10 while lint was typecheck-only and coverage was shallow. |
| Error boundary missing/weak | Partly correct | An ErrorBoundary existed but only wrapped after app initialization. Root render is now wrapped too. |
| OAuth race risk | Plausible | Code manually parses hash and also enables Supabase URL detection; needs tests and simplification. |
| ESLint/Prettier absent | Correct | No real ESLint gate exists yet. |
| CI missing | Correct | No GitHub Actions workflow found locally. |
| Core game architecture promising | Correct | The engine and managers are better than the repository hygiene. |

## Standards Used For 10/10 Target

- OWASP ASVS 5.0 for application security verification: https://owasp.org/www-project-application-security-verification-standard/
- WCAG 2.2 AA for accessibility expectations: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- Core Web Vitals thresholds: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at the 75th percentile: https://web.dev/articles/defining-core-web-vitals-thresholds
- Lighthouse performance budgets for enforceable bundle/resource limits: https://web.dev/articles/use-lighthouse-for-performance-budgets
- Google SRE SLO guidance: define user-centered SLIs/SLOs and error budgets: https://sre.google/sre-book/service-level-objectives/

## Current Scorecard

| Area | Score | Reason |
| --- | ---: | --- |
| Gameplay foundation | 7.5 | Real loop, wave system, upgrades, and persistence patterns. Needs feature audit and more tests. |
| Security | 4.5 | Source cleanup started, but rotated keys and history scrub are still outstanding. |
| Testing | 4.0 | Only 9 tests; coverage is very low for auth, cloud save, stats, leaderboard, and UI. |
| Tooling | 5.0 | Typecheck/build/test exist; real lint, formatting, CI, budgets, and thresholds missing. |
| Performance | 6.0 | Build passes but main chunk is over Vite's warning threshold. |
| Accessibility | 5.5 | Some React UI structure exists; no automated WCAG gate or manual checklist evidence. |
| Documentation honesty | 6.5 | README and taskboard corrected; older docs still need cleanup/archive. |
| Business/portfolio readiness | 6.5 | Good demo potential, but security history and inflated claims must be fixed before client-facing promotion. |

## Taskboard

### P0 - Security And Credibility

- [x] Remove committed fallback Supabase credentials from app code.
- [x] Remove committed service-role credentials from admin scripts.
- [x] Replace `.env.example` with placeholders.
- [x] Run dependency audit and fix current advisories.
- [ ] Rotate Supabase anon and service-role keys.
- [ ] Scrub repository history and force-push only after backups are confirmed.
- [ ] Run a secret scan over the cleaned repo.
- [ ] Verify RLS policies with direct negative tests.

### P1 - Quality Gates

- [x] Add a working coverage command.
- [ ] Add ESLint + Prettier and make `npm run lint` a real lint gate.
- [ ] Add coverage thresholds.
- [ ] Add GitHub Actions CI.
- [ ] Add auth/database manager tests.
- [ ] Add UI smoke tests for login, guest play, game over, leaderboard, and settings.

### P1 - Product Truth

- [ ] Audit feature claims in README/TASKS/SESSION/ANALYSIS.
- [ ] Mark premium/ad functionality as demo-only or integrate real providers.
- [ ] Document known limitations and roadmap plainly.

### P2 - Production Hardening

- [ ] Split the large main bundle.
- [ ] Add bundle budgets and Lighthouse budget checks.
- [ ] Add automated accessibility checks and manual WCAG 2.2 AA checklist.
- [ ] Add operational notes for auth failures, cloud-save failures, and rollback.

## 10/10 Definition

BugSmasher earns a credible 10/10 only when all of this is true:

- No secrets in working tree, docs, or git history.
- Keys have been rotated after the leak.
- Lint, typecheck, tests, coverage, build, and audit run in CI and pass on a clean clone.
- Critical auth/cloud/game-state modules have meaningful branch tests.
- Public docs match shipped behavior.
- Bundle size and accessibility have enforceable budgets.
- OAuth, offline mode, and degraded cloud behavior are explicitly tested.
