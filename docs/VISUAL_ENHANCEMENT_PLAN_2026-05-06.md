# BugSmasher Visual Enhancement Plan (2026-05-06)

## Current Visual State

### What We Have Now
- **Core Stack**: React + Tailwind CSS + Framer Motion + Lucide Icons
- **Rendering**: Canvas-based gameplay (GameEngine) with vector shapes
- **UI Style**: Glassmorphism/dark theme with cyan accents
- **Animations**: Basic CSS transitions + Framer Motion variants
- **Assets**: No bitmap/sprite assets - pure shapes/colors
- **Particle Effects**: Defined in BiomeConfig but minimal implementation

### What's Missing
- Sprite-based enemies/turrets (currently circles/rectangles)
- Pixel art aesthetic for retro arcade feel
- Custom backgrounds per biome
- CRT/monitor effects (scanlines, bloom, vignette)
- Pixel fonts for authentic retro typography
- Environmental details (grass, rocks, decorations)

---

## Visual Enhancement Options (Free/Available Skills)

### Option A: Pixel Art Sprites (Recommended)
**Impact: HIGH | Effort: MEDIUM | Cost: FREE**

Using the `pixel-art` skill to generate retro-style sprites:

| Asset | Style | Description |
|-------|-------|-------------|
| Bug enemies | `nes` or `arcade` | 8-bit bug sprites (32x32px) |
| Turrets | `nes` | Pixel turret variations |
| Base | `nes` | Pixel base/castle |
| Backgrounds | `snes` | 16-bit biome backgrounds |
| UI Frames | `pico8` | Pixel art borders/buttons |

**Workflow**: Use pixel-art skill → Generate sprites → Cache in `/public/sprites/`

---

### Option B: Shader Effects (Medium Impact)
**Impact: MEDIUM | Effort: LOW | Cost: FREE**

Using existing libraries:
- **Scanlines**: CSS overlay with repeating linear gradient
- **CRT Bloom**: CSS blur + blend modes
- **Vignette**: Radial gradient overlay
- **Chromatic Aberration**: CSS filter effects

---

### Option C: Pixel Fonts (Low Effort)
**Impact: MEDIUM | Effort: LOW | Cost: FREE**

Replace system fonts with:
- **Press Start 2P** (Google Fonts)
- **VT323** for terminal feel
- **Pixelade** for modern pixel look

---

### Option D: Animated Backgrounds (High Impact)
**Impact: HIGH | Effort: MEDIUM | Cost: $0 (Pollinations.AI)**

Using `p5js` or `pixel-art-video` skill:
- Animated pixel art backgrounds per biome
- Particle systems for environmental effects
- Parallax scrolling layers

---

## Recommended Implementation Order

### Phase 1: Critical Visuals (Week 1)
1. **Pixel Art Bug Sprites** (NES style, 3 enemy types)
   - Basic bug (green)
   - Fast bug (red) 
   - Tank bug (blue)
   
2. **CRT Effect Overlay** (CSS only)
   - Scanlines
   - Vignette
   - Subtle bloom
   
3. **Pixel Font Integration**
   - Press Start 2P for headers
   - VT323 for body text

### Phase 2: Environment (Week 2)
1. **Biome Backgrounds** (SNES style)
   - Neon Core
   - Crystal Caverns
   - Volcanic Forge
   - Arctic Peaks
   
2. **Turret Upgrade Sprites**
   - 3 levels per type
   - Visual progression clarity

3. **UI Pixel Frames**
   - Upgrade menu borders
   - Score panel frames
   - Button states

### Phase 3: Polish (Week 3)
1. **Animated Backgrounds** (P5.js or pixel-art-video)
   - Gentle parallax
   - Environmental particles
   
2. **Screen Effects**
   - Damage flash
   - Wave transition zoom
   - Game over glitch effect

---

## Skill Integration Plan

| Skill | Purpose | Output |
|-------|---------|--------|
| `pixel-art` | Generate static sprites | PNG files (32x32 to 64x64) |
| `pixel-art-video` | Animated backgrounds | MP4/GIF loops |
| `p5js` | Interactive effects | Canvas backgrounds |
| `popular-web-designs` | UI polish reference | Design inspiration |
| `comfyui` (if Ollama available) | Concept art for sprites | Reference sheets |

---

## Free Asset Sources (Backup)

1. **itch.io** - Free game assets (CC0 license)
2. **OpenGameArt** - Pixel art sprites
3. **Kenney.nl** - Free game assets
4. **Pollinations.AI** - AI generated sprites (FREE tier)

---

## File Structure Proposal

```
/public/
  /sprites/
    bugs/
      bug-basic.png
      bug-fast.png
      bug-tank.png
    turrets/
      turret-l1.png
      turret-l2.png
      turret-l3.png
    backgrounds/
      neon-core.png
      crystal-cavern.png
      volcanic-forge.png
```

---

## Next Steps

**Option A (Recommended)**: Start with pixel art sprites
**Option B**: Begin with CSS shader effects only
**Option C**: Full visual overhaul with both

Which path do you want to pursue? I recommend starting with **Option A: Pixel Art Sprites** for immediate visual impact.