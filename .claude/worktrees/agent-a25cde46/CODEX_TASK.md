# CODEX AGENT PROMPT — BugSmasher: Progression + Mid-Game Save

## CONTEXT

You are working on **BugSmasher by HopeTheory** — a wave-based clicker defense game deployed at https://bugsmasher-ten.vercel.app.

**Why this task:** The owner's brothers are actively playing the current release. Two critical gaps make the game frustrating:
1. **Progression feels empty** — only high scores track. No XP, levels, or rewards keep them invested.
2. **Can't save mid-game** — every death wipes everything. No way to pause and come back later.

Both systems already exist in the codebase (XP/levels/crystals in Supabase schema, CloudSaveManager for state persistence) — they just aren't wired into the game UI/loop yet.

---

## PROJECT FACTS

**Location:** `/mnt/h/DevJourney/Projects/BugSmasher-AiStudio/`
**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Motion, Supabase
**Brand:** Cyberpunk — #00FFCC (cyan) primary, #FF3333 (red), #050505 (bg)
**Tagline:** DEFEND THE CORE. SMASH THE SWARM.

**Supabase is LIVE with these tables:**
- `profiles` (id, username, xp, level, crystals, avatar_id)
- `user_stats` (total_kills, games_played, achievements_unlocked, current_streak)
- `game_saves` (profile_id, game_state JSONB, timestamp, version)
- `leaderboard` (profile_id, score, wave)

**Managers already exist:**
- `AuthManager` — guest/account auth, profile sync
- `StatsManager` — stats tracking, cloud sync
- `CloudSaveManager` — auto-save every 30s, cloud sync
- `LeaderboardManager` — global rankings
- `AchievementSystem` — 17 achievements with XP rewards

**GameConfig (src/game/GameConfig.ts):**
- Canvas, player, upgrades, bug types, powerups, wave config — all config-driven
- No hardcoded magic numbers

**Key files to read before starting:**
- `src/game/GameEngine.ts` — core game loop, state machine, wave logic
- `src/game/database/types.ts` — all type definitions including GameStateSnapshot
- `src/game/database/CloudSaveManager.ts` — existing save infrastructure
- `src/game/database/StatsManager.ts` — existing stats tracking
- `src/components/PauseMenu.tsx` — where save/resume UI goes
- `src/components/HUD.tsx` — where XP bar and level display go
- `src/components/GameOver.tsx` — where progression rewards show
- `src/components/MainMenu.tsx` — where resume-saved-game goes

---

## TASK 1: WIRE PROGRESSION SYSTEM

### What exists but isn't connected:
- `Profile` type has `xp`, `level`, `crystals` fields
- `Achievement` type has `xp_reward` field
- `XP_PER_LEVEL = 100` constant in types.ts
- `ACHIEVEMENTS_LIST` with XP rewards defined

### What to build:

#### 1a. XP Awards (GameEngine.ts)
Award XP for these events:
- Kill a bug: `+1 XP`
- Complete a wave: `+10 XP * wave_number`
- Unlock an achievement: XP already defined per achievement in ACHIEVEMENTS_LIST
- High score in a game: `score / 100` XP on game over

Call `statsManager.syncToCloud()` after awarding XP.

#### 1b. Level-Up Logic
```
Level formula: level = floor(1 + sqrt(xp / XP_PER_LEVEL))
XP_PER_LEVEL = 100 (from types.ts)
```
When `level` increases, trigger a visual level-up event:
- Show a level-up banner in HUD with a flash effect
- Award bonus crystals on level-up: `+5 * new_level` crystals
- Bonus: every 5 levels = bonus wave skip (start at wave 1 + floor(level/5))

#### 1c. HUD XP Bar (HUD.tsx)
Add below the health bar:
- Horizontal XP bar: current XP vs XP needed for next level
- Format: `LVL {n} ████████░░ 75% (750/1000 XP)`
- On level-up: animate the bar filling, flash green, show "+{n} CRYSTALS!"
- Color scheme: #00FFCC (cyan) for XP bar

#### 1d. Crystals Display
- Add crystal count next to score in HUD: `💎 1,250`
- Crystals come from: level-up bonuses, achievement rewards (define crystal rewards in ACHIEVEMENTS_LIST too, e.g., +10 crystals per achievement)

#### 1e. Game Over Screen (GameOver.tsx)
After score display, show progression summary:
- "Session XP: +{n}" earned this game
- "Crystals Earned: +{n}"
- "New Level: {old} → {new}" (if leveled up)
- Show stats: total kills, highest wave, time played

---

## TASK 2: MID-GAME SAVE / RESUME

### What exists:
- `CloudSaveManager` class with `saveGame(state: GameStateSnapshot)` method
- `GameStateSnapshot` type with full state (score, wave, health, upgrades, etc.)
- Auto-save every 30 seconds via `setInterval`

### What to build:

#### 2a. Save & Quit Button (PauseMenu.tsx)
In the PauseMenu, add a "Save & Quit" button:
```
┌─────────────────────────────────────┐
│         [Save & Quit Game]          │
│   Your progress will be saved.      │
└─────────────────────────────────────┘
```
This should:
1. Call `cloudSaveManager.saveGame()` with current GameStateSnapshot
2. Call `statsManager.syncToCloud()`
3. Navigate to MainMenu

#### 2b. Resume Saved Game (MainMenu.tsx)
On MainMenu, after pressing "Play":
1. Check `cloudSaveManager.getCurrentSave()` for a saved game
2. If save exists AND is < 24 hours old:
   - Show a secondary button: "Continue: Wave {n}, Score {s}"
   - "New Game" button as the other option
3. If user clicks "Continue": load the saved state and start from that wave

#### 2c. State Snapshot Completeness
The current `GameStateSnapshot` (types.ts) might be missing some fields the engine uses. Audit `GameEngine.ts` state and ensure `GameStateSnapshot` captures everything needed to resume — including:
- Current powerup states (active shield? multiplier? timers?)
- Bug/wave spawn state
- Any accumulated combo/chain state
- Particle system state (or just reset particles on restore)

#### 2d. Restore Flow (Game.tsx)
When a saved game is loaded:
1. Reconstruct the full GameEngine state from `GameStateSnapshot`
2. Restore health, score, wave, upgrades
3. Start at the saved wave number (bugs already spawned or reset?)
4. Show a brief "Game Restored" toast

**Decision:** For simplicity — when restoring a saved game, START the saved wave fresh (don't try to restore mid-wave bug positions). This prevents complex state reconstruction bugs.

---

## QUALITY STANDARDS

### Must pass before calling done:
1. `npm run typecheck` — zero TypeScript errors
2. `npm test` — all existing tests pass
3. `npm run build` — production build succeeds
4. Manual test: Play a game → pause → save & quit → return → verify state restored

### Code style:
- Use `console.warn` for recoverable errors, never `console.error`
- Config-driven: no magic numbers — if you add new values, put them in GameConfig.ts
- All new functions must be typed (no `any`)
- Preserve existing game feel: dark cyberpunk aesthetic, #00FFCC primary

### Performance:
- Don't re-render the entire HUD on every frame
- XP/crystal updates only on change events, not every tick
- Debounce cloud saves

---

## BRAND COMPLIANCE

- NO human figures, emojis are fine (💎, 🔥, ⚡)
- Dark cyberpunk: bg #050505, primary #00FFCC, danger #FF3333
- Fonts: JetBrains Mono / Space Mono for UI
- Sound: use existing SoundManager for any new audio cues
- Tagline: DEFEND THE CORE. SMASH THE SWARM.

---

## VERIFICATION CHECKLIST

After completing both tasks, verify:

- [ ] Kill a bug → XP increases in HUD
- [ ] Complete wave 3 → big XP award shown
- [ ] XP bar fills and level-up flashes green
- [ ] Crystals increase on level-up
- [ ] Game over → progression summary shows XP/crystals earned
- [ ] Pause → "Save & Quit" button visible
- [ ] Save & Quit → returns to MainMenu
- [ ] MainMenu → shows "Continue" button with saved state
- [ ] Continue → game starts at saved wave with saved health/score/upgrades
- [ ] All TypeScript compiles clean
- [ ] All existing tests pass
- [ ] Build succeeds
- [ ] No new console errors in browser

---

## FILES YOU MAY NEED TO CREATE OR MODIFY

**Modify:**
- `src/game/GameEngine.ts` — add XP awards, state snapshot export
- `src/game/database/StatsManager.ts` — add XP/crystal award methods
- `src/components/HUD.tsx` — XP bar, crystal count, level display
- `src/components/PauseMenu.tsx` — Save & Quit button
- `src/components/MainMenu.tsx` — Continue saved game option
- `src/components/GameOver.tsx` — progression rewards summary
- `src/game/database/types.ts` — extend GameStateSnapshot if needed

**Read (don't modify):**
- `src/game/GameConfig.ts` — reference for config values
- `src/game/database/CloudSaveManager.ts` — save/restore infrastructure
- `src/game/database/AuthManager.ts` — profile access
