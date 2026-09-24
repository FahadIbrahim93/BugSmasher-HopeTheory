# BugSmasher — Portfolio Showcase Snapshot

**Status:** Production-grade indie arcade (React 19 + TypeScript + Canvas 2D + Firebase)  
**Live:** https://bugsmasher-hopetheory.vercel.app  
**Repo:** https://github.com/FahadIbrahim93/BugSmasher-HopeTheory  
**Version:** 2.5.0 (main @ verified green CI)

## Why this is portfolio-ready

| Dimension              | Evidence                                                                 | Score |
|------------------------|--------------------------------------------------------------------------|-------|
| Architecture           | Specialized systems (WaveManager, CollisionSystem, Renderer, etc.), clear boundaries | 9/10 |
| Security               | Firestore deny-by-default, server callables + Zod, rate limits, session tokens, checksums | 9/10 |
| Testing                | 752+ frontend tests, 26 emulator, Playwright E2E, coverage floors enforced | 9/10 |
| CI/CD                  | Full GitHub Actions (typecheck, lint, coverage, emulator, build, CodeQL) | 9/10 |
| Performance            | Delta-time game loop, PerformanceScaler, 60+ FPS target                 | 8/10 |
| Accessibility          | Difficulty presets, reduced motion, colorblind modes                     | 8/10 |
| Code quality           | Strict TS, modular, AGENTS.md + S.C.O.P.E. discipline                    | 8/10 |
| Documentation honesty  | STATUS.md + verification records over victory claims                     | 9/10 |

**Overall portfolio rating: 9/10** — ship as showcase immediately. Remaining gaps are polish (ESLint warnings volume, Prettier gate, deeper a11y/performance evidence), not blockers.

## Engineering highlights for reviewers

- Real-time Canvas 2D engine with requestAnimationFrame + dt
- Server-authoritative score/save paths (no client-only leaderboard trust)
- Progressive disclosure via AGENTS.md + skills
- Anti-bloat + Universal Output Contract for all reviews
- PWA + offline-first paths

## Quick verification (run these)

```bash
npm ci
npm run typecheck
npm run test:coverage
npm run build
```

See `docs/STATUS.md` for the latest numeric baseline (2026-08-30).
