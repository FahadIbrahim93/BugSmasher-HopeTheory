# Feature Truth Matrix

Last updated: 2026-05-06

This file tracks the current truth of major BugSmasher capabilities.

Status values:
- **Shipped** — implemented and broadly usable in the current repo
- **Partial** — implemented, but with notable gaps, caveats, or incomplete evidence
- **Demo-only** — present in local/demo form, not a fully real production integration
- **Blocked externally** — depends on operator or platform work outside local code changes

Use this together with:
- `README.md` for the public summary
- `docs/ULTIMATE_10_10_PLAN.md` for roadmap priorities
- `docs/DATA_AND_SYNC.md` for persistence-specific truth
- `docs/PRODUCTION_HARDENING_CHECKLIST.md` for what must be proven before strong production claims

| Feature | Status | Evidence | Current limitation | Next action |
| --- | --- | --- | --- | --- |
| Core gameplay loop | Shipped | `src/game/GameEngine.ts`, `src/game/WaveManager.ts` | Architecture and test depth are still below 10/10 standard | Stabilize architecture and deepen risk-path tests |
| Main menu and game flow | Shipped | `src/App.tsx`, `src/components/MainMenu.tsx`, `src/components/Game.tsx` | UI flows still need stronger regression coverage and accessibility verification | Add integration/browser smoke coverage |
| Persistent progression systems | Partial | progression and manager files under `src/game/` and UI overlays under `src/components/` | Meaning and consistency of some upgrade/progression flows still need alignment and clearer evidence | Clarify product truth and tighten integration tests |
| Guest play | Shipped | `src/game/database/AuthManager.ts` | Still needs stronger documentation of degraded-mode expectations | Add explicit auth-path evidence and docs |
| Email auth | Partial | `src/game/database/AuthManager.ts` | Behavior and trust boundaries require stronger validation and clearer truthfulness | Add auth-path tests and document exact support level |
| OAuth auth | Partial | `src/game/database/AuthManager.ts` | Provider-backed behavior depends on external configuration and stronger verification | Validate provider flows and document operational requirements |
| Cloud save | Partial | `src/game/database/CloudSaveManager.ts` | Save versioning, precedence, and recovery behavior need stronger integrity guarantees | Define schema/versioning and add failure-path tests |
| Resume / continue flow | Partial | `src/components/GameCanvas.tsx`, `src/game/GameEngine.ts`, `src/game/database/CloudSaveManager.ts` | Fidelity and exact restored state need clearer evidence | Add corrupt-save, restore, and resume integrity tests |
| Leaderboard | Partial | `src/game/database/LeaderboardManager.ts`, `src/components/GameOver.tsx` | Falls back to mock/local behavior and needs clearer truthfulness | Document fallback behavior and improve integrity validation |
| Stats sync | Partial | `src/game/database/StatsManager.ts` | Semantics and reconciliation need stronger verification | Add integrity tests and align documentation |
| Offline-first local persistence | Shipped | localStorage usage across database managers | Needs clearer precedence and corruption handling documentation | Capture in `docs/DATA_AND_SYNC.md` |
| Achievements and challenges | Shipped | `src/game/AchievementSystem.ts`, `src/game/DailyChallenge.ts`, related UI | Still need broader regression coverage and truth alignment with public docs | Add targeted tests and feature evidence |
| Biomes and prestige systems | Shipped | biome/prestige files under `src/game/` and `src/components/` | Need stronger integration and UX verification | Add scenario coverage and document limits |
| Premium / monetization paths | Demo-only | related files such as `src/game/PremiumManager.ts`, UI components | Not a verified real provider-backed commerce implementation | Keep labeled demo-only until real integration exists |
| Rewarded ads | Demo-only | `src/components/RewardedAd.tsx`, `src/game/AdManager.ts` | Not a verified real ad-provider integration | Keep labeled demo-only until real integration exists |
| CI quality enforcement | Partial | `.github/workflows/ci.yml` | Current CI does not yet run every gate described in the 10/10 target state | Align workflow with `docs/QUALITY_GATES.md` |
| Accessibility readiness | Partial | component overlays and controls across `src/components/` | Keyboard, focus, and dialog verification are not yet strong enough for 10/10 claims | Add evidence and tighten UI semantics |
| Production operations readiness | Partial | planning docs only | Runbooks and telemetry expectations are not yet fully encoded as operating practice | Complete `docs/OPERATIONS_RUNBOOK.md` and tie to evidence |
| Secret hygiene and security remediation | Blocked externally | hardening docs and repo history concerns | Requires operator action for key rotation and possible history cleanup | Close external blockers and record proof |

## Rules for using this matrix

- `README.md` should summarize only what this matrix can honestly support.
- If a feature depends on external configuration or real providers, it must not be labeled fully shipped without evidence.
- When a feature graduates from Partial or Demo-only to Shipped, update the evidence and the limitation fields together.
