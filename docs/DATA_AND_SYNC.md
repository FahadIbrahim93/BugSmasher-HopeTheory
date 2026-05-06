# Data And Sync

Last updated: 2026-05-06

This is the living documentation for BugSmasher persistence, cloud sync, stats, and leaderboard behavior.

Use this together with:
- `docs/FEATURE_TRUTH_MATRIX.md` for capability truth and limitations
- `docs/TEST_STRATEGY.md` for required persistence-related evidence
- `docs/PRODUCTION_HARDENING_CHECKLIST.md` for release blocking conditions
- `docs/ARCHITECTURE.md` for where these managers sit in the runtime design

This file replaces `DATABASE.md` as the living source of truth.

## Current persistence model

BugSmasher is designed as a **local-first browser game** with **cloud-oriented managers** for auth, saves, stats, and leaderboard data.

### Main persistence surfaces
- auth and profile state
- player stats and achievements
- save/resume snapshot state
- leaderboard data

### Primary modules
- `src/game/database/AuthManager.ts`
- `src/game/database/CloudSaveManager.ts`
- `src/game/database/StatsManager.ts`
- `src/game/database/LeaderboardManager.ts`
- `src/game/database/index.ts`
- `src/game/database/types.ts`

## Runtime truth today

### Auth bootstrap
`src/game/database/index.ts` currently does the following during initialization:
- removes `bugsmasher_auth` from localStorage inside `initializeDatabase()`
- initializes stats immediately
- restores auth, stats, and cloud save in `restoreUserData()` only if authenticated

This is a major behavior truth and should be treated as a known design gap on the path to 10/10, not as ideal final behavior.

### Cloud save behavior
`src/game/database/CloudSaveManager.ts` currently:
- stores save snapshots in localStorage under `bugsmasher_cloud_save`
- writes cloud saves via Supabase if configured
- uses a hardcoded snapshot version string of `1.4.0`
- restores cloud data first if available, otherwise falls back to local save
- auto-saves on a timer while gameplay is running

### Stats behavior
`src/game/database/StatsManager.ts` currently:
- persists stats and achievements in localStorage
- syncs stats to Supabase if configured
- records `total_score` using `Math.max`, which means the field behaves more like a best/high score than a cumulative lifetime score

### Leaderboard behavior
`src/game/database/LeaderboardManager.ts` currently:
- writes to Supabase if configured
- falls back to local mock leaderboard data if cloud load is unavailable or empty
- can splice the current player into loaded leaderboard results using local stats

That means the leaderboard experience is functional but not yet a fully trust-perfect competitive source of truth.

## Data structures

## Profile
Defined in `src/game/database/types.ts`.

Key fields:
- `id`
- `username`
- `email`
- `avatar_id`
- `is_guest`
- `level`
- `xp`
- `crystals`

## User stats
Defined in `src/game/database/types.ts`.

Key fields:
- `total_playtime`
- `total_kills`
- `total_score`
- `highest_wave`
- `games_played`
- `powerups_collected`
- `upgrades_purchased`
- `achievements_unlocked`
- streak tracking fields

## Cloud save snapshot
Defined in `src/game/database/types.ts` as `GameStateSnapshot`.

Current stored snapshot includes:
- `score`
- `wave`
- `health`
- run upgrade levels
- unlocked biomes
- equipped cosmetics
- prestige level
- achievement unlocks
- daily challenge state

## Leaderboard entry
Defined in `src/game/database/types.ts`.

Key fields:
- `rank`
- `profile_id`
- `username`
- `avatar_id`
- `score`
- `wave`
- `updated_at`

## Truthful caveats that matter

These are current reality and must remain visible until fixed:

1. **Initialization currently clears local auth state**
   - Source: `src/game/database/index.ts`
2. **Cloud save versioning is stale relative to current package version**
   - Source: `src/game/database/CloudSaveManager.ts`
3. **Stats naming and semantics need tightening**
   - `total_score` currently behaves like a max score in `src/game/database/StatsManager.ts`
4. **Leaderboard trust is partial**
   - mock/local fallback behavior is still part of the current implementation in `src/game/database/LeaderboardManager.ts`
5. **Save fidelity needs stronger evidence**
   - resume and save state are real features, but they need more explicit integrity tests and schema discipline to support 10/10 claims

## Target-state rules for 10/10

The project should move toward the following rules:

### Save schema and versioning
- save version must track the actual supported snapshot schema
- schema changes must have a documented compatibility or migration policy
- restore behavior must be deterministic for older or invalid snapshots

### Local/cloud precedence
The codebase should have explicit documented rules for:
- local newer than cloud
- cloud newer than local
- corrupt local with valid cloud
- valid local with unavailable cloud
- guest account vs authenticated user behavior

### Data integrity expectations
- save and restore must preserve the intended game state, not just a subset
- stats semantics must match their names
- leaderboard behavior must be clearly marked as real, partial, or fallback
- failures must degrade predictably without silently inventing false confidence

## Required evidence before strong production claims

A true 10/10 state requires tests and documentation for:
- corrupt local save handling
- save version mismatch handling
- restore precedence behavior
- offline cloud failure handling
- leaderboard fallback truthfulness
- stats correctness across repeated sessions
- authenticated vs guest behavior differences

See `docs/TEST_STRATEGY.md` for the required test categories.

## What this document intentionally does not do

- It does not claim the current model is already ideal.
- It does not duplicate a full SQL schema guide.
- It does not include credentials, admin shortcuts, or historical environment snapshots.

If schema DDL or migration specifics are needed later, they should live in a dedicated schema or migration reference, not in a mixed status document.
