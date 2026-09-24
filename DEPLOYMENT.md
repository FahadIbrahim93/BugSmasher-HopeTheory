# BugSmasher — Deployment Guide

**Status:** Operational reference; verify current `docs/STATUS.md` before release.  
**Primary hosting:** Vercel  
**Secondary hosting:** Firebase Hosting + GitHub Pages (portfolio mirror)  
**Source of truth:** `main`

## 1. Before deploying

Read, in order:

1. [Current Status](./docs/STATUS.md)
2. [Live Taskboard](./TASKBOARD.md)
3. [Release Certification](./docs/RELEASE_CERTIFICATION.md)
4. [Agentic Workflow](./docs/AGENTIC_WORKFLOW.md)

Never deploy merely because a local build succeeds. A release candidate must satisfy the certification gates appropriate to the release.

## 2. Local prerequisites

- Node.js version compatible with the current CI/runtime configuration;
- npm;
- Firebase CLI for manual Firebase operations;
- authenticated access to the target deployment platform.

Do not commit environment secrets, service-account JSON, or server-only checksum secrets.

## 3. Environment

### Client configuration

`VITE_FIREBASE_*` values are public client configuration and may be present in the browser bundle. They are not secret credentials.

### Server configuration

`CHECKSUM_SALT` is server-only and must never be exposed through `VITE_*` variables or committed to source.

Other integration-specific keys must follow their provider's secret-handling requirements.

## 4. Verification commands

```bash
npm run typecheck
npm run lint:eslint
npm test
npm run test:coverage
npm run test:emulator
npm run build
npx playwright test
```

The repository-wide gate is:

```bash
npm run ci
```

The exact GitHub Actions result on the exact commit is the authoritative release evidence.

## 5. GitHub Actions

Primary workflow: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)

The quality pipeline verifies type safety, lint, Functions build/tests, dependency/security checks where configured, frontend coverage, Firestore emulator tests and production build. A separate Playwright job consumes the validated build artifact.

Do not interpret a skipped job as a passing job.

## 6. Hosting reality

The repository historically used both Vercel and Firebase Hosting. Treat them as separate deployment targets.

### Vercel

Vercel is the primary player-facing host. Automatic Git-based deployment depends on the Vercel project being connected to this GitHub repository. Connection status must be verified in the Vercel dashboard; repository documentation must not claim push-to-deploy is active without evidence.

### Firebase Hosting

Firebase Hosting is a secondary target. The GitHub workflow can deploy when the required `FIREBASE_SERVICE_ACCOUNT` secret is configured. A successful GitHub build alone does not prove Firebase Hosting updated.

### GitHub Pages (portfolio mirror)

Free secondary host for portfolio / backup. Target URL after first successful deploy:

`https://fahadibrahim93.github.io/BugSmasher-HopeTheory/`

Workflow: `.github/workflows/deploy-pages.yml`  
- Builds with `GITHUB_PAGES=true` so Vite uses `base: '/BugSmasher-HopeTheory/'`.
- Copies `index.html` → `404.html` so SPA client routes survive refresh (Pages has no rewrite rules).
- Deploys via the official Pages actions.

**One-time setup (required):** Repo Settings → Pages → Build and deployment → Source = **GitHub Actions**.

Vercel continues to use `base: '/'` and remains the primary player-facing host.

## 7. Manual deployment

### Vercel

Use the Vercel dashboard or CLI according to the currently configured project. Verify the resulting production deployment and perform a browser smoke test.

### Firebase Hosting

```bash
npm ci
npm run build
# then firebase deploy --only hosting (with correct project & credentials)
```
