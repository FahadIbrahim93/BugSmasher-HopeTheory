# BugSmasher by HopeTheory — v2.0 Architecture (Fresh Start)

## Vision
Defend the Core. Smash the Swarm. Rise through the Biomes.

Hyper-polished, addictive browser arcade title that sets new standards for HTML5 games in 2026.

**Target:** Semi-viral with 10k+ MAU via share loops + X/itch.io.

## Core Pillars
- **Gameplay:** Tight click/tap smashing with combo chains, dynamic difficulty, 12+ powerups
- **Visuals:** Cyber-neon biomes, advanced particle systems, squash/stretch, screen shake
- **Progression:** Session XP → Permanent upgrades → Prestige → Cosmetics & Biomes
- **Tech:** Modular, testable, 60FPS locked, PWA, haptics
- **Philosophy:** "Never GIVE UP on your HOPES" woven into lore and death cards

## Tech Stack v2.0
- **Framework:** React 19 + Vite 6 + TypeScript 5
- **Styling:** Tailwind + shadcn/ui + Glassmorphism
- **Game Engine:** Custom Canvas 2D + ECS-lite (no God objects)
- **State:** Zustand (game + UI sync)
- **Audio:** Web Audio API + Howler.js
- **Persistence:** Supabase (realtime) + IndexedDB fallback
- **Testing:** Vitest + Playwright
- **Deploy:** Vercel + PWA manifest

## Project Structure
```
bugsmasher-hopetheory-v2/
├── src/
│   ├── app/                 # React app shell
│   ├── game/                # Pure engine (zero React)
│   │   ├── core/            # Engine, Loop, EventBus
│   │   ├── entities/        # Bug, Core, Projectile, Particle
│   │   ├── systems/         # Input, Wave, Particle, Upgrade, Audio, Renderer
│   │   ├── config.ts
│   │   └── types.ts
│   ├── components/          # UI overlays only
│   ├── stores/              # Zustand stores
│   ├── lib/                 # Supabase, utils
│   └── assets/
├── docs/
├── supabase/
├── .github/workflows/       # CI
```

## Quality Gates
- 90%+ test coverage on engine
- No `any` types
- Delta-timed 60FPS loop with cap
- Entity pooling mandatory
- Event-driven communication

**This is the definitive reset.** All future work lands here.