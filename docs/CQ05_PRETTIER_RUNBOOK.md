# CQ-05 — Prettier-clean runbook

**Task:** Standardize formatting (`prettier --check .` green) and gate it in CI.

## Why this is a separate local step

The agent sandbox used for the enterprise track cannot complete a full `npm install` + tree-wide Prettier write reliably (network/IO limits). The formatting change itself is mechanical and must be done on a normal developer machine.

## Exact commands (2–5 minutes)

```bash
git clone https://github.com/FahadIbrahim93/BugSmasher-HopeTheory.git
cd BugSmasher-HopeTheory
git checkout -b cq-05-prettier-clean origin/main
npm ci
npm run format          # rewrites ~181 files
npm run format:check    # must exit 0
git add -A
git commit -m "style(cq-05): prettier --write across the tree"
git push -u origin cq-05-prettier-clean
```

Open a PR against `main`. After it merges:

1. On branch `cq-05-prettier-gate` (or a follow-up), change the CI step from `continue-on-error: true` to hard fail:
   ```yaml
   - name: Format check (prettier — hard gate)
     run: npm run format:check
   ```
2. Mark CQ-05 `[x]` on TASKBOARD with the PR link as evidence.

## Acceptance (from TASKBOARD)

- `prettier --check .` exits 0 on the release commit
- No formatting churn mixed with behavior work
- CI gate eventually hard (after the clean tree lands)

## Notes

- Existing Prettier config: `.prettierrc` (singleQuote, trailingComma all, printWidth 100, etc.)
- `lint-staged` already formats `*.{md,json,yml,yaml,css}` on commit; this task covers the whole tree including TS/TSX.
- Do not mix this PR with ESLint or behavior changes.
