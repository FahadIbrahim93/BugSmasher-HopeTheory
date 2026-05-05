# BugSmasher Tasks & Issues

## v1.6.1 Status: ✅ COMPLETE (2026-05-06)

### Visual Overhaul Complete
- **New Fonts** — Orbitron, JetBrains Mono, Inter ✅
- **Glass Panel System** — backdrop-filter blur ✅
- **Neon Text Glow** — biome accent colors ✅
- **Animations** — logo-pulse, slide-up, shimmer, border-pulse ✅
- **Button System** — btn-primary/secondary/share/ghost ✅
- **HUD/Menu Refresh** — score display, wave banner, combo ✅
- **Death Cards** — biome-themed with watermark ✅
- **Mobile Responsive** — typography scaling ✅

### Documentation Added
- docs/ARCHITECTURE.md
- docs/QUALITY_GATES.md
- docs/TEST_STRATEGY.md
- docs/ULTIMATE_10_10_PLAN.md
- docs/LOGBOOK.md
- docs/PRODUCTION_HARDENING_CHECKLIST.md
- docs/AGENTS_AND_TASKBOARD.md

---

## v1.6.0 Status: ✅ COMPLETE (2026-05-05)

### Features Shipped
- **Persistent upgrades** — 8 crystal-gated upgrades, UpgradeMenu, GameEngine wired ✅
- **Mechanically different biomes** — each biome changes bug types, powerup rates, difficulty ✅
- **Shareable death cards** — canvas-based 1200x630 PNG, biome-themed, Web Share API + download fallback ✅
- **PR #2 merged** — Codex changes: auth/gameplay fields, UpgradeMenu accessibility, HUD hardening, GameOver leaderboard ✅
- **BiomeSelectButton bug** — fixed `biome.difficulty` → `biome.gameplay.difficultyMultiplier` ✅

---

## v1.5.0 Status: ✅ COMPLETE (2026-05-03)

### Pain Points Resolved
- **"Progression feels empty"** → XP/level/crystal system now visible in HUD
- **"Death wipes everything"** → Mid-game save via pause menu + continue button

---

## v1.5.1 Status: ✅ COMPLETE (2026-05-03)

### P3 Bugs Fixed + Features Wired
- **B1** Daily challenge validation — GameEngine passes real missCount + playTimeSeconds
- **B2** Cloud leaderboard — GameOver uses real Supabase via LeaderboardManager
- **B3** Biome↔SaveManager sync — constructor loads from SaveManager, unlockBiome() persists
- **B4** PrestigeScreen — confirmation modal with live bonus preview + cost breakdown
- **B5** HUD wiring — PrestigeDisplay + DailyChallengeBadge + Globe button always visible
- **B6** MainMenu wiring — PrestigeDisplay + DailyChallengeBadge below profile avatar
- **B7** BiomeSelectButton in PauseMenu + checkUnlocks() call on game end
- **B8** PrestigeScreen offer after death (score >= 50,000)
- **B9** supabaseConfig.test.ts — fixed with @vitest-environment node

---

## ✅ Completed Tasks (v1.5.1)

| Task | Status | Notes |
|------|--------|-------|
| v1.0 Core game loop | ✅ Done | Wave-based survival clicker |
| Supabase Auth Setup | ✅ Done | PostgreSQL + Auth |
| Google OAuth | ✅ Done | Working |
| Session Persistence | ✅ Done | localStorage + cloud |
| Email/Password Auth | ✅ Done | Working |
| Guest Mode | ✅ Done | Offline-first |
| Centralized Config | ✅ Done | supabaseConfig.ts |
| Auto session restore | ✅ Done | onAuthStateChange |
| Achievement System | ✅ Done | 17 achievements, 58 total |
| Daily Streak | ✅ Done | AchievementSystem |
| Haptics (vibrate) | ✅ Done | navigator.vibrate |
| Social Share | ✅ Done | Web Share API |
| Damage Numbers | ✅ Done | Floating popups |
| Tutorial Overlay | ✅ Done | Skip + polish |
| Custom Logo/Meta | ✅ Done | Favicon, meta, theme |
| Animated Main Menu BG | ✅ Done | MatrixRain.tsx |
| More Powerups | ✅ Done | 7 powerup types |
| Score Fly-to Animation | ✅ Done | Smooth score counter |
| **Progression System (v1.5)** | ✅ Done | XP/level/crystals/HUD |
| **Mid-Game Save (v1.5)** | ✅ Done | CloudSave + Continue |
| **Auto-Save (v1.5)** | ✅ Done | 30s interval |
| **GameOver Summary (v1.5)** | ✅ Done | XP/crystals/rank |

---

## Quality Gates — v1.5.0

| Gate | Result |
|------|--------|
| Typecheck | ✅ Clean |
| Tests | ✅ 58/58 pass |
| Build | ✅ 767KB gzip |
| Deploy | ⚠️ Pending (needs Vercel rebuild) |

---

## 📋 Backlog (v1.7.0+)

||| Priority | Task | Notes |
|||----------|------|-------|
| | P1 | **Shareable death cards** | ✅ Done (v1.6.0) — canvas 1200x630, biome-themed, Web Share API |
| | P1 | **Persistent upgrades** | ✅ Done (v1.6.0) — 8 upgrades, UpgradeMenu, GameEngine wired |
| | P1 | **Mechanically different biomes** | ✅ Done (v1.6.0) |
| | P2 | **Discord OAuth** | Ready to test — needs OAuth callback setup |
| | P2 | **AdMob integration** | Banner + interstitial + rewarded video ads |
| | P2 | **Crystal IAP** | Remove Ads purchase |
| | P2 | **Profile sync** | More data to cloud |
| | P3 | **Apple OAuth** | Optional |
| | ~~P3~~ | ~~Loading spinner~~ | ✅ Done — Preloader.tsx wired in App.tsx |
| | ~~P3~~ | ~~Prestige system~~ | ✅ Done (v1.5.1) |
| | ~~P3~~ | ~~Multiple biomes~~ | ✅ Done (v1.5.1) |
| | ~~P3~~ | ~~Daily challenges~~ | ✅ Done (v1.5.1) |
| | ~~P3~~ | ~~Cloud leaderboard~~ | ✅ Done (v1.5.1) |

---

## Quality Gates — v1.6.1

| Gate | Result |
|------|--------|
| Tests | ✅ 92/92 pass |
| Build | ✅ Clean |
| Lint | ✅ Pass |

---

*Updated: 2026-05-06 | Version 1.6.1 | Visual Overhaul Complete*

---

## 🚀 Quick Start

```bash
cd bugsmasher
npm install
npm run dev      # → http://localhost:3000
npm run build    # production
```

---

*Updated: 2026-05-03 | Version 1.5.0 | Quality Gates: 58/58 tests, build clean*
