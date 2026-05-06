# Architecture

Last updated: 2026-05-06

This document describes the current runtime architecture of BugSmasher and the main design gaps between the current codebase and a true 10/10 state.

Use this together with:
- `docs/ULTIMATE_10_10_PLAN.md` for phase ordering
- `docs/DATA_AND_SYNC.md` for persistence behavior
- `docs/FEATURE_TRUTH_MATRIX.md` for product truth
- `docs/OPERATIONS_RUNBOOK.md` for deploy and failure-response expectations

## High-level shape

BugSmasher currently has three major runtime layers:

1. **React application shell**
   - boot flow, main menu, overlays, and high-level navigation
2. **Imperative game engine and domain systems**
   - wave logic, rendering, gameplay state, powerups, progression, and runtime simulation
3. **Persistence and backend-oriented managers**
   - auth, save, stats, leaderboard, and related local/cloud state management

## Current module map

### React shell
Key files:
- `src/App.tsx`
- `src/components/MainMenu.tsx`
- `src/components/Game.tsx`
- `src/components/GameCanvas.tsx`
- overlay and menu components under `src/components/`

Responsibilities:
- app boot and screen switching
- menu/game UI composition
- passing callbacks into the game engine surface
- rendering overlays like pause, upgrade, game over, and settings flows

### Game engine and gameplay systems
Key files:
- `src/game/GameEngine.ts`
- `src/game/WaveManager.ts`
- `src/game/Renderer.ts`
- `src/game/ParticleSystem.ts`
- `src/game/GameConfig.ts`
- related gameplay modules under `src/game/`

Responsibilities:
- simulation loop
- wave spawning and progression
- pointer interaction
- combat state and runtime entities
- gameplay rewards and some progression hooks

### Persistence and backend managers
Key files:
- `src/game/database/index.ts`
- `src/game/database/AuthManager.ts`
- `src/game/database/CloudSaveManager.ts`
- `src/game/database/StatsManager.ts`
- `src/game/database/LeaderboardManager.ts`
- `src/game/database/types.ts`

Responsibilities:
- profile and session state
- cloud save and local save management
- stats persistence and achievement-related state
- leaderboard reads and writes
- local/cloud fallback behavior

## Boot flow today

`src/App.tsx` currently orchestrates startup roughly like this:

1. app mounts
2. `initializeDatabase()` runs
3. `authManager.initialize()` resolves
4. `authManager.checkSession()` runs
5. `restoreUserData()` runs
6. `statsManager.initialize()` runs
7. app marks DB as ready
8. preloader transitions to menu

This means the root React component currently knows about database boot sequencing and owns the high-level readiness gate.

## Gameplay flow today

The main gameplay chain looks like this:

1. `App.tsx` enters `playing`
2. `Game.tsx` renders `GameCanvas`
3. `GameCanvas.tsx` constructs a `GameEngine`
4. `GameEngine` owns the loop, rendering helpers, wave manager, save manager, and several progression hooks
5. React overlays observe or mutate engine state via refs and callbacks

This separation is workable, but it is not yet a clean 10/10 boundary.

## Current coupling concerns

These are the most important architecture gaps to understand honestly.

### 1. React and engine are tightly coupled in critical flows
Examples include:
- gameplay overlays in `Game.tsx` directly coordinating engine pause/resume and upgrade behavior
- UI components relying on direct engine refs and mutation patterns
- HUD state being updated through imperative loops rather than a clean state boundary

### 2. Game engine still knows too much about persistence-side concerns
`GameEngine.ts` currently imports and interacts with:
- auth manager
- stats manager
- cloud save manager
- leaderboard manager
- upgrade system
- biome manager

That means simulation, progression, and persistence concerns are not fully separated.

### 3. Database initialization and runtime state are not yet governed by a clean application service layer
`src/game/database/index.ts` and `src/App.tsx` currently coordinate startup in a way that makes boot behavior easy to drift and harder to test as a single policy.

## Current architecture strengths

These should be preserved where possible:
- React and canvas gameplay are at least separated into distinct components and files
- core game subsystems such as wave management and rendering are not entirely collapsed into one file
- persistence concerns already have named manager boundaries, which gives a starting point for cleaner service design later

## Target direction for 10/10

The codebase should evolve toward these rules:

### React shell
- React should orchestrate user flow and presentation
- React should consume explicit state or events rather than leaning on hidden engine mutation

### Game engine
- the engine should focus on simulation and deterministic gameplay behavior
- it should emit meaningful gameplay events rather than directly owning broad persistence policy

### Application/persistence layer
- auth, saves, stats, and leaderboard should be coordinated through clearer service boundaries
- cross-cutting concerns like telemetry and release diagnostics should not be hidden inside gameplay code

## Architectural evidence needed for 10/10

A true 10/10 state does not require overengineering, but it does require:
- clearly documented runtime boundaries
- fewer hidden cross-layer side effects
- easier testing of gameplay without real backend dependencies
- easier testing of persistence logic without full gameplay runtime involvement
- living docs that reflect the actual architecture, not an imagined one

## Documentation rule

If architecture changes materially:
- update this file
- update `docs/DATA_AND_SYNC.md` if persistence boundaries changed
- update `docs/FEATURE_TRUTH_MATRIX.md` if feature support or limitations changed
- update `docs/TEST_STRATEGY.md` if new test obligations were introduced
