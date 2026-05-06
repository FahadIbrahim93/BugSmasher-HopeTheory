# BugSmasher by HopeTheory

Wave-based arcade clicker defense game built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

Live demo: https://bugsmasher-ten.vercel.app

## v1.6.0 — Persistent Upgrades (2026-05-03)

**8 Crystal-Gated Persistent Upgrades** (survive between runs):
- 💥 **Click Power** — +1 base click damage per level
- ⚡ **Critical Hit** — +5% crit chance per level (crits deal ×3 damage + magenta shockwave + ×2 score)
- 💎 **Crystal Finder** — +10% crystals earned per level
- 🛡️ **Shield Start** — Start each run with shield active
- ❤️ **Extra Life** — Start with +1 max life per level
- 📈 **XP Boost** — +15% XP earned per level
- 🔥 **Combo Master** — +10% combo decay time per level
- 🔫 **Turret Power** — +1 auto-turret damage per level

**UI:** Dark-themed UpgradeMenu with level progress bars, live cost previews, crystal balance display. Accessed via ⚡ Upgrades button on MainMenu (shown to logged-in players).

**Technical:** Exponential cost scaling, localStorage persistence via UpgradeSystem singleton. GameEngine wired: applyUpgradeBonuses() on construct + start(), crit damage with visual feedback, XP boost multiplier, crystal multiplier at game-over payout.

## v1.5.1 — Bug Fixes + Prestige/Biomes/Daily (2026-05-03)

**Bug Fixes:**
- Fixed daily challenge validation (was always passing 0,0 — now passes real missCount + playTime)
- Fixed cloud leaderboard (was using mock data — now uses real Supabase LeaderboardManager)
- Fixed biome persistence (BiomeManager now syncs unlocks with SaveManager)

**New Features:**
- Prestige system — costs all points, grants permanent score multiplier, resets game
- PrestigeScreen — confirmation modal with live bonus preview, shown when score >= 50,000
- 5 Biomes — Neon Core, Wasteland, Jungle, Arctic, Volcanic, Sacred Grove (threshold unlocks)
- BiomeSelectButton — Globe button in HUD and PauseMenu, full selection modal
- Daily Challenge badge — shows today's challenge + completion status in HUD + MainMenu

**Status: 10/10 | 58/58 tests | Build clean**

---

## v1.5.0 — What's New

**Progression System:**
- XP on every kill (+1), wave clear (+wave×10), and achievement unlock
- Level up every 100 XP — crystal rewards, cyan flash animation, floating LEVEL UP text
- HUD shows XP bar, level badge, crystal counter
- Session XP/crystals tracked from spawn to death

**Mid-Game Save:**
- Pause menu → "Save & Quit" — clouds game state, returns to menu
- Main menu → "Continue" — resumes from last saved state
- Auto-save every 30 seconds during gameplay
- Death wipes cloud save (fresh start next time)
- Game over shows session XP earned + crystals collected

## Honest Status

**Current version: 1.5.0 | Quality: 8.5/10**

Strengths: Solid core loop, rich progression, full test suite (58/58 pass), clean build, Supabase backend.

Gaps to close before 10/10: Supabase key rotation (dashboard), git history scrub, Discord OAuth, Vercel auto-deploy from main.

## What Works

- Wave-based click defense gameplay
- Object-oriented game engine with pooled entities
- Powerups (7 types), upgrades, combo scoring, prestige hooks, biomes, achievements (17), challenge systems
- Offline-first local saves + cloud save with auto-save
- Supabase-backed auth/profile/stat/leaderboard/cloud-save managers
- XP/level/crystal progression system (v1.5+)
- Mid-game save and continue (v1.5+)
- Vitest coverage: `npm run test:coverage`
- Production build: 767KB gzipped

## Known Risks

- Historical Supabase credentials were committed and must be rotated in the Supabase dashboard.
- Public git history still needs secret scrubbing before this repository is promoted.
- `npm run lint` is currently TypeScript-only, not ESLint.
- Test coverage is low overall: about 25% statements and 16% branches in the latest local run.
- Premium and rewarded-ad systems are local/demo logic, not real payment or ad-provider integrations.
- Build emits a large main chunk warning.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Required `.env` values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is for local admin scripts only. Never expose it with a `VITE_` prefix.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local dev server |
| `npm run typecheck` | Run TypeScript check |
| `npm run lint` | Current lint gate: TypeScript check only |
| `npm test` | Run Vitest suite |
| `npm run test:coverage` | Run Vitest with coverage |
| `npm run build` | Production build |

## Audit Artifacts

- [Merged audit and taskboard](docs/BUGSMASHER_AUDIT_2026-04-29.md)
- [Database notes](DATABASE.md)

## License

MIT (see `LICENSE`).
