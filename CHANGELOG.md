# Changelog

All notable changes to **BugSmasher** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Mobile HUD occlusion:** Left panel (Score, Wave, Core Escape, Rage, Contamination) no longer blocks ~half the play area on small screens. Rage + Contamination sit side-by-side; padding/gaps tightened; desktop `[SPACE / SHIFT]` badge hidden below `sm` (PR #75). Production Vercel deploy on `main` @ `cb60902`.

### Added

- GitHub Pages secondary deploy workflow (portfolio mirror). One-time Settings → Pages → Source = GitHub Actions required (PR #74).
- `docs/PORTFOLIO_SHOWCASE.md` — honest 9/10 scorecard for reviewers (PR #73).
- AGENTS.md Universal Output Contract + preferred review skills (PR #73).

## [2.5.0] — 2026-06-30

### Added

- Cloud Functions: `saveGameData` and `submitScore` callables with Zod schema validation
- Firebase Emulator test suite: 17 integration tests (7 rules + 10 callables)
- Server-side checksum + monotonic high-score enforcement
- Rate limiting (10 saves/min, 5 score submits/min per user)
- `docs/VERIFICATION_2026-06-30.md` with command evidence

### Changed

- Firestore rules: deny direct client writes to `private/saves` and `leaderboard`
- Server-authoritative save/score paths (no more client-trusted leaderboard)
- Coverage thresholds: engine/lib at 77/61/75/76 (interim, Phase 2b target: 80/70/75/80)

### Fixed

- 507/507 frontend tests passing
- Security: hardcoded client SALT removed; OAuth scopes minimized

## [2.4.0] — 2026-06-22

### Added

- GitHub Actions CI: lint, functions build, coverage, build
- `@vitest/coverage-v8` — coverage enforcement in CI
- `.env.example` — Firebase config env vars
- PWA: vite-plugin-pwa with Service Worker + runtime caching
- Accessibility: difficulty presets, reduced motion, colorblind filter, gamepad

### Changed

- See git history for full 2.4.0 notes.
