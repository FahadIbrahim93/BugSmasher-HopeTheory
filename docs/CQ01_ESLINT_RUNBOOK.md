# CQ-01 — ESLint zero-warning campaign

**Acceptance (TASKBOARD):** `npm run lint:eslint` exits 0 with **0 errors and 0 warnings** on supported source/tooling.

**Baseline:** 910 warnings / 0 errors (2026-08-30 on `bbc7250`).

## Config reality

`eslint.config.js` uses:

- `typescript-eslint` **strictTypeChecked** + **stylisticTypeChecked**
- React + react-hooks + jsx-a11y recommended
- Prettier last (disables formatting conflicts)

Many rules are intentionally `'warn'` during migration (`no-explicit-any`, all `no-unsafe-*`, `prefer-nullish-coalescing`, `no-unnecessary-condition`, react-hooks purity/immutability/refs, etc.). CQ-01 means those warnings go to zero — either by fixing code or by a **documented** rule decision with a tracked exception (project exception policy in RELEASE_CERTIFICATION).

## Warning categories (expected bulk)

| Category | Typical rules | Strategy |
|----------|---------------|----------|
| A. Unsafe any / assignment | `no-explicit-any`, `no-unsafe-*` | Type the call sites; prefer generics over `any`; CQ-02 overlaps |
| B. Nullish / optional chain | `prefer-nullish-coalescing`, `prefer-optional-chain` | Mechanical `\|\|` → `??`, `.x && .x.y` → `?.` |
| C. Unnecessary conditions | `no-unnecessary-condition` | Remove dead checks; narrow types |
| D. React purity / effects | `react-hooks/purity`, `set-state-in-effect`, `refs`, `immutability` | CQ-03; move time/random out of render; intentional patterns documented |
| E. Promises | `no-floating-promises`, `misused-promises` (already **error**) | Must stay green |
| F. Console | `no-console` | Keep only `warn`/`error`; strip `log`/`info` |
| G. Unbound methods | `unbound-method` | Bind, arrow, or intentional class callback docs |
| H. a11y | `jsx-a11y/*` | Real fixes preferred over disables |

## Execution order (one concern per PR)

1. **Inventory** — run `npm run lint:eslint -f json -o eslint-report.json` (or stylish) and count by rule. Commit the summary under `docs/eslint-baseline-*.md` if useful.
2. **Mechanical batch B+F** — nullish/optional-chain + console.log removal. Low risk, high volume.
3. **CQ-02 overlap** — eliminate production `any` / unsafe access in non-test code.
4. **CQ-03** — React purity (render-time `Date.now` / `Math.random` / ref anti-patterns).
5. **Engine callbacks** — unbound-method and loop-func in game systems.
6. **a11y leftovers** — feed into AX-* tasks when they are product defects.
7. **Final** — zero warnings; optional: promote selected rules from `warn` → `error` so regression is impossible.

## Hard rules for this campaign

- Never lower a threshold or delete tests to green the gate.
- Prefer fix over `eslint-disable`. Any disable needs a one-line reason and a TASKBOARD follow-up if temporary.
- Do not mix Prettier-only churn into ESLint PRs (CQ-05 is separate).
- One primary rule-family per PR when the diff would otherwise be huge.

## Local commands

```bash
npm ci
npm run lint:eslint
npm run lint:eslint -- --format stylish | tee eslint-out.txt
# optional JSON for counting:
npm run lint:eslint -- --format json -o eslint-report.json
```

## Definition of done

- [ ] `npm run lint:eslint` → 0 errors, 0 warnings
- [ ] CI Lint step green without `continue-on-error`
- [ ] TASKBOARD CQ-01 marked `[x]` with PR evidence
- [ ] No new blanket `eslint-disable` without justification

## Relationship to other tasks

- **CQ-02** (no avoidable `any`) is a subset of category A.
- **CQ-03** (React purity) is category D.
- **CQ-05** (Prettier) must not be mixed into these PRs.
- **AX-*** may absorb remaining jsx-a11y issues that are product defects.
