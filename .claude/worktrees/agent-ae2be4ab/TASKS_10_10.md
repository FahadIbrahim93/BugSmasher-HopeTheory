# BugSmasher 10/10 Taskboard

Status as of 2026-04-29: **not 10/10 yet**. Current evidence-backed readiness is about **6.6/10**.

## Done Today

- Removed committed Supabase fallback credentials from app config.
- Converted admin scripts to read credentials from local environment variables.
- Replaced `.env.example` secrets with placeholders.
- Added `test:coverage` script and installed Vitest V8 coverage provider.
- Applied `npm audit fix`; production dependency audit now reports 0 vulnerabilities.
- Wrapped the root React render in the existing error boundary.
- Replaced public README claims with evidence-backed status.

## P0 Security

- [ ] Rotate Supabase anon and service-role keys in the Supabase dashboard.
- [ ] Scrub leaked credentials from git history with BFG or `git filter-repo`.
- [ ] Revoke any test users/passwords that appeared in public docs.
- [ ] Re-run secret scanning before pushing.
- [ ] Verify RLS policies manually against every table and archive screenshots or SQL evidence.

## P1 Engineering Quality

- [ ] Add real ESLint + Prettier config for React and TypeScript.
- [ ] Keep `typecheck` separate from `lint`.
- [ ] Add GitHub Actions for install, lint, typecheck, tests, coverage, build, and audit.
- [ ] Add coverage thresholds and raise risk-module coverage first.
- [ ] Add auth manager tests for configured/unconfigured Supabase, OAuth URL handling, email auth failures, and guest conversion.
- [ ] Add manager tests for stats, cloud save, leaderboard, premium, ads, achievements, and daily challenges.

## P1 Product Truth

- [ ] Audit every claimed feature against actual behavior.
- [ ] Mark premium and rewarded ads as demo-only unless real providers are integrated.
- [ ] Remove remaining inflated status language from historical docs or move it into archived notes.

## P2 Performance And Operations

- [ ] Split the main app bundle or configure manual chunks.
- [ ] Add bundle/performance budgets.
- [ ] Add WCAG 2.2 AA accessibility checks for keyboard focus, target sizes, and auth flows.
- [ ] Add SLO/monitoring notes for auth failures, cloud-sync failures, and leaderboard writes.

## Exit Criteria

- All quality gates pass: lint, test, coverage, build, audit.
- No leaked secrets in working tree or repository history.
- Critical modules have meaningful branch coverage, not just aggregate coverage.
- Feature claims match shipped behavior.
- CI enforces the same gates locally and remotely.
