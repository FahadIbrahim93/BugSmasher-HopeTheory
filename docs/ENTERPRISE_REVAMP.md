# BugSmasher Enterprise 10/10 Revamp

**Branch:** `enterprise-10-10-revamp`  
**Manager decision timestamp:** 2026-09-26  
**Authority:** Full autonomous execution granted by owner for this track.

## Locked Priorities

1. **Engineering excellence (A)** — Strictly close every remaining gap already defined in `docs/STATUS.md`, `docs/RELEASE_CERTIFICATION.md`, and `TASKBOARD.md` until the project can be truthfully certified **10/10**. No raising of floors beyond what is already written.
2. **Visual / art overhaul (B)** — Upgrade the art pipeline (higher-fidelity assets, improved VFX/goop, professional SFX) while remaining Canvas 2D + CSS. Scenario skills may be used for asset generation. No WebGL rewrite.
3. **Product / gameplay** — Secondary only. Execute existing UX polish items from TASKBOARD after engineering + visual foundation are solid. No new modes until certified.

## Success Definition

Certification is PASS only when `docs/RELEASE_CERTIFICATION.md` records a complete green evidence set on the exact release commit. No partial claims.

## Execution Order (P0 → P1)

### Phase 0 — Governance & Truth (immediate)
- Protect main (P0-GOV-01) — requires repo settings.
- Keep STATUS / TASKBOARD / this document synchronized with evidence.
- Add `format:check` to CI once Prettier-clean is achieved.

### Phase 1 — Zero-debt Code Quality (highest leverage)
| ID | Task | Target |
|----|------|--------|
| CQ-05 | Prettier-clean tree + gate | `prettier --check .` green |
| CQ-01 | ESLint 0 errors / 0 warnings | `eslint .` green |
| CQ-02 | Eliminate avoidable `any` | no production `any` without documented exception |
| CQ-03 | React purity | no render-time Date.now / Math.random / mutable ref anti-patterns |
| CQ-04 | Hook dependency correctness | documented or fixed |

### Phase 2 — Coverage & Reliability
| ID | Task | Target |
|----|------|--------|
| T-01 | Coverage floors | 85/85/85/75 |
| T-02 | Critical branch coverage | GameEngine, SaveManager, WaveManager, InputSystem, security paths |
| T-04 | E2E critical journey | launch → play → pause → game-over → save/leaderboard |

### Phase 3 — Accessibility & Performance Evidence
- AX-01 … AX-05 (keyboard, focus, reduced-motion, contrast, AT review)
- PERF-01 … PERF-04 (budgets in repo, stress + mobile evidence)

### Phase 4 — Security / Competitive Integrity Close-out
- S-04 adversarial suite completion
- S-05 documented decision on signed/deterministic runs

### Phase 5 — Operations Evidence
- OPS-01 … OPS-06 (deploy reproducibility, monitoring real-or-descope, rollback, backup, privacy)

### Phase 6 — Visual Upgrade (only after Phase 1–2 green)
- Professional SFX replacement (top player-facing gap noted in DESIGN_DOC)
- Higher-fidelity bug assets + goop VFX (Scenario pipeline where useful)
- Colorblind canvas filter + reduced-motion fidelity
- Achievement gallery visual dashboard

### Phase 7 — Final Certification
- Adversarial audit on exact commit
- `docs/RELEASE_CERTIFICATION.md` → PASS
- STATUS updated

## Non-Goals (YAGNI)
- New game modes
- WebGL / Three.js rewrite
- Monetization or ads until certified
- Raising coverage or security bars beyond existing written targets

## Working Rules (inherited + reinforced)
- One primary task ID per PR.
- Evidence before any status change.
- Never lower a threshold to manufacture a pass.
- Never claim a provider is production-ready while it is a stub.
- Documentation must lag reality, never lead it.

## Current State Snapshot (at branch creation)
- `main` tip ~ `800f1e4` (enterprise branch base)
- Last fully verified CI baseline: 2026-08-30 `bbc7250` (green, 81.7% lines, 910 ESLint warnings, Prettier not gated)
- Certification: NOT CERTIFIED

## Next Concrete Action
1. Make the tree Prettier-clean (CQ-05).
2. Burn ESLint warnings to zero (CQ-01).
3. Raise coverage to certification floors (T-01).

This document is the single source of truth for the enterprise-10-10-revamp track.
