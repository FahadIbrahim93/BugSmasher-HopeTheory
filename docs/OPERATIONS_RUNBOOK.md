# Operations Runbook

Last updated: 2026-05-06

This document defines the operational expectations for BugSmasher on the path to a true 10/10 state.

Use this together with:
- `docs/PRODUCTION_HARDENING_CHECKLIST.md` for required release gates
- `docs/QUALITY_GATES.md` for the engineering and CI contract
- `docs/FEATURE_TRUTH_MATRIX.md` for current system truth
- `docs/ULTIMATE_10_10_PLAN.md` for strategic sequencing

## Current Operational Status (Audit 2026-05-06)

**Operational Readiness: 5/10**
- **Build Status**: ❌ Failing (Tailwind dependency issues prevent deployment)
- **CI/CD**: ⚠️ Basic pipeline exists but will fail on build
- **Monitoring**: ❌ No performance monitoring or error tracking
- **Config Management**: ⚠️ No environment-specific configs
- **Documentation**: ⚠️ Partial - missing deployment troubleshooting

## Purpose

BugSmasher should not be treated as operationally mature just because it builds locally.

A 10/10 state requires:
- a clear release procedure
- a rollback procedure
- explicit handling for high-trust failure modes
- documented expectations for telemetry and diagnostics

**Audit Finding**: Current state does not meet operational maturity. Build failures and lack of monitoring are critical gaps.

## Environment and secret handling

### Rules
- browser-facing configuration may use `VITE_` variables only for safe public client configuration
- service-role or admin-only secrets must never be exposed through `VITE_` variables
- historically exposed secrets must be treated as compromised until rotated and verified

### Operational expectation
- local setup instructions belong in `README.md`
- release-blocking secret and auth conditions belong in `docs/PRODUCTION_HARDENING_CHECKLIST.md`
- environment truth for feature support belongs in `docs/FEATURE_TRUTH_MATRIX.md`

## Release procedure

A strong release claim should require at minimum:

1. confirm living docs are current and not contradictory
2. run the local quality pipeline required for the release scope
3. verify CI status matches documented gate expectations
4. verify known external blockers are still accurately disclosed
5. confirm no new public-facing claim exceeds available evidence

## Rollback procedure

A true 10/10 state requires a rollback plan even if the project is small.

Minimum rollback expectations:
- know which deployment target is active
- know how to restore the last known-good build
- know whether auth, cloud-save, or leaderboard behavior changed in the failed release
- know whether user data integrity is affected or only the UI/app shell
- record the failure and any required follow-up docs updates

## Critical failure modes to plan for

## Auth failures
Examples:
- provider unavailable
- invalid environment configuration
- session restore failure
- user appears signed out unexpectedly

Operational expectation:
- local gameplay should degrade predictably where intended
- auth-related product truth must remain honest in docs
- repeated auth failure patterns should be observable once telemetry is introduced

## Cloud save failures
Examples:
- write fails
- restore fails
- stale or invalid save version encountered
- cloud/local precedence conflict

Operational expectation:
- behavior must be deterministic and documented
- failures must not silently imply success
- save integrity issues must be triaged as high-trust defects

## Leaderboard failures
Examples:
- write rejection
- read timeout
- fallback data shown when cloud data is unavailable

Operational expectation:
- leaderboard failure must not break local play
- fallback behavior must be truthful and documented
- competitive claims must be conservative until integrity is proven

## Fatal UI/runtime failures
Examples:
- boot failure
- overlay dead-end preventing progression
- runtime exception during game flow

Operational expectation:
- failure path should be diagnosable
- docs should not overclaim operational maturity until telemetry and repeatable diagnostics improve

## Telemetry expectations

BugSmasher does not reach 10/10 operational maturity without at least a documented telemetry plan.

The following event families should eventually exist:
- auth failure events
- cloud save failure events
- leaderboard write/read failure events
- fatal UI/runtime error events
- release or build verification evidence

This document records the expectation even if the instrumentation is not fully implemented yet.

## Incident documentation expectations

When a release-affecting defect is found:
- capture the symptom
- identify whether it is security, trust, gameplay, persistence, or operational scope
- update the relevant living doc if system truth changed
- update the roadmap or checklist if the incident reveals a missing gate

## Documentation sync rules

Any operationally relevant change should trigger review of:
- `docs/PRODUCTION_HARDENING_CHECKLIST.md`
- `docs/FEATURE_TRUTH_MATRIX.md`
- `docs/DATA_AND_SYNC.md`
- `README.md` if public-facing behavior changed

## What this runbook is not

This is not a claim that BugSmasher already has full production observability.
It is the living contract for what operational maturity must look like before the project can honestly present itself as 10/10.
