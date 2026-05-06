# Test Strategy

Last updated: 2026-05-06

This file defines the testing priorities for BugSmasher.

Use this together with:
- `docs/QUALITY_GATES.md` for the engineering contract
- `docs/DATA_AND_SYNC.md` for persistence-specific truth
- `docs/FEATURE_TRUTH_MATRIX.md` for which capabilities are partial or demo-only
- `docs/ULTIMATE_10_10_PLAN.md` for roadmap sequencing

## Current Test Coverage Status (Audit 2026-05-06)

**Overall Coverage: 41% statements, 33% branches, 62% functions, 42% lines**
- **Critical Gaps**: Renderer.ts (0.2%), AuthManager.ts (20%), GameEngine.ts (44%)
- **Total Tests**: 809 tests across 89 files
- **Test Types**: Mostly unit tests, minimal integration/E2E
- **Status**: 2/10 - Requires immediate attention

## Testing philosophy

BugSmasher should not chase coverage as a vanity metric.

A true 10/10 state requires testing the places where users can lose trust:
- auth and session restore
- save/resume integrity
- cloud sync failure behavior
- leaderboard and stats correctness
- critical gameplay state transitions
- UI regression in core overlays and flow control

## Current testing reality

The repo already has automated tests, mainly concentrated in game and manager modules.

**Audit Findings:**
- 809 tests pass but don't cover critical paths
- Renderer (0% coverage) handles all visual output
- AuthManager (20% coverage) manages user sessions
- No E2E tests for user flows
- No performance/load testing

What is still missing at 10/10 level:
- broader auth-path coverage
- corrupt-save and recovery coverage
- stronger leaderboard/stats integrity coverage
- React component-level coverage for critical flows
- browser-level smoke or end-to-end verification

## Recommended test layers

## 1. Unit tests

Use for deterministic logic with low integration overhead.

Examples:
- wave logic
- upgrade math
- challenge logic
- pure data transformation or conflict resolution helpers

## 2. Integration tests

Use for high-risk module interactions.

High-priority targets:
- `src/game/database/AuthManager.ts`
- `src/game/database/CloudSaveManager.ts`
- `src/game/database/StatsManager.ts`
- `src/game/database/LeaderboardManager.ts`
- gameplay save/resume flows that touch engine state plus persistence

## 3. UI and component tests

Use for critical user-facing state transitions.

Priority flows:
- main menu start and continue behavior
- pause, save, and quit flow
- auth overlays and account flows
- game over and leaderboard presentation
- upgrade and progression overlays that gate gameplay continuation

## 4. Browser smoke tests

Use for confidence in real user paths.

Minimum future target set:
- guest can launch game and start a run
- player can finish a run without the UI dead-ending
- save and continue path works in the browser
- leaderboard screen loads without breaking local gameplay
- auth and degraded-mode paths behave predictably

## Risk-based test matrix

| Area | Priority | Why it matters | Minimum evidence needed |
| --- | --- | --- | --- |
| Auth/session restore | P0 | Broken auth destroys trust and identity continuity | success + failure path tests |
| Cloud save / resume | P0 | Lost run state is one of the highest-trust failures | save, restore, corrupt, and offline tests |
| Stats / achievements | P1 | Player progression must be accurate | repeated-session integrity tests |
| Leaderboard | P1 | Competitive credibility depends on correctness | submit, load, fallback, and failure tests |
| Core gameplay state transitions | P1 | Dead-end or broken wave/game-over flows are highly visible | integration tests for major transitions |
| Accessibility-critical overlays | P1 | Dialog and keyboard failures block users | UI regression evidence |
| Demo-only monetization/ad paths | P2 | Must not overclaim real integration | truthfulness and containment tests |

## Specific scenarios that must be covered

## Auth
- guest sign-in
- email sign-in success and failure
- signup success and failure
- OAuth handoff success and failure where testable
- session restore behavior
- sign-out behavior
- degraded behavior when Supabase is unavailable

## Save and resume
- save snapshot created successfully
- restore from local save
- restore from cloud save
- corrupt local save handling
- local/cloud precedence behavior
- save version mismatch behavior
- game state remains coherent after resume

## Leaderboard and stats
- stats update correctly after game end
- leaderboard submission does not break local play on failure
- mock/local fallback behavior is explicit and testable
- repeated sessions do not silently corrupt totals or best-score semantics

## UI flow regressions
- pause and resume
- save and quit
- continue from menu
- game over handling
- any overlay that can block gameplay progression

## Coverage expectations

Current aggregate thresholds are documented in `vitest.config.ts`, but they are not sufficient to define 10/10 quality on their own.

A true 10/10 state should:
- raise thresholds gradually
- emphasize branch coverage in high-risk modules
- track whether critical failure paths are tested, not just line totals

## Documentation rules

Whenever a new high-risk path is added or changed:
- update the relevant test coverage
- update `docs/FEATURE_TRUTH_MATRIX.md` if the feature status changes
- update `docs/DATA_AND_SYNC.md` if persistence behavior changes
- update `docs/QUALITY_GATES.md` if the quality contract changes

## Definition of done for test maturity

The testing strategy is working when:
- the highest-risk trust boundaries have explicit automated evidence
- UI dead-end regressions are less likely to escape
- docs do not imply confidence that tests do not actually provide
- CI and documentation agree on what is enforced today vs what is still roadmap work
