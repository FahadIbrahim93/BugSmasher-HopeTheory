# BugSmasher: Progression + Mid-Game Save
## Project: /mnt/h/DevJourney/Projects/BugSmasher-AiStudio/

### PAIN POINTS (from real players)
1. Progression feels empty — only score tracks. Need XP, levels, crystal rewards.
2. Can't save mid-game — death = full wipe. No resume option.

### READ FIRST
- `src/game/database/types.ts` — existing types (Profile has xp/level/crystals, GameStateSnapshot defined)
- `src/game/GameEngine.ts` — core loop, where to hook XP awards
- `src/game/database/CloudSaveManager.ts` — save infrastructure (exists, not wired to UI)
- `src/components/HUD.tsx` — where XP bar goes
- `src/components/PauseMenu.tsx` — where Save & Quit goes
- `src/components/MainMenu.tsx` — where Continue/Resume goes
- `src/components/GameOver.tsx` — where progression summary goes

### TASK 1: PROGRESSION
**XP Awards (GameEngine.ts):**
- Kill bug: +1 XP
- Complete wave: +10 * wave_number XP
- Game over: score/100 XP
- Achievement unlock: XP from ACHIEVEMENTS_LIST

**Level formula:** `level = floor(1 + sqrt(xp / 100))` (XP_PER_LEVEL=100 in types.ts)

**Level-up rewards:**
- +5 * level crystals on each level-up
- Visual: green flash, "+{n} CRYSTALS!" in HUD
- Every 5 levels: +1 starting wave bonus

**HUD (HUD.tsx):** Below health bar, show:
- `LVL {n} ████░░░░░ 65% (650/1000 XP)` bar
- `💎 {crystal_count}` next to score
- Level-up animation on each level increase

**Game Over (GameOver.tsx):** Show session XP, crystals earned, level progression

### TASK 2: MID-GAME SAVE
**PauseMenu:** Add "Save & Quit" button that calls `cloudSaveManager.saveGame(state)` then goes to MainMenu

**MainMenu:** After "Play", check `cloudSaveManager.getCurrentSave()`. If save exists (< 24h old), show "Continue: Wave {n}, Score {s}" vs "New Game"

**Restore:** Load saved GameStateSnapshot, restore health/score/wave/upgrades, start saved wave fresh (don't restore mid-wave bug positions)

**Snapshot audit:** Ensure GameStateSnapshot captures everything needed to resume. Add any missing fields.

### QUALITY GATES
- `npm run typecheck` — zero errors
- `npm test` — all pass
- `npm run build` — succeeds
- Manual: play → pause → save & quit → return → verify resume works

### BRAND
- #00FFCC cyan primary, #050505 bg, #FF3333 red danger
- Dark cyberpunk aesthetic
- No human figures
- Use SoundManager for audio cues

### VERIFY
- [ ] Kill bug → XP increases
- [ ] Complete wave → big XP award
- [ ] XP bar fills, level-up flashes
- [ ] Crystals increase on level-up
- [ ] Game over → progression summary
- [ ] Pause → Save & Quit visible
- [ ] Save & Quit → MainMenu
- [ ] MainMenu → Continue button with saved state
- [ ] Continue → resumes at saved wave
- [ ] Typecheck + tests + build all clean
