// Visual Enhancement Patch for BugSmasher
// Integrates BugVisualDefinitions with existing Renderer

import { Bug } from './GameEngine';
import { getBugVisual, BUG_VISUALS } from '../assets/bugs/BugVisualDefinitions';

// Enhanced bug drawing using visual definitions
export function drawEnhancedBug(ctx: CanvasRenderingContext2D, bug: Bug, time: number, isMobile: boolean) {
  const visual = getBugVisual(bug.type);

  // Use existing rendering but apply visual definition colors
  ctx.save();
  ctx.translate(bug.x, bug.y);

  // Swarmer jitter
  if (bug.type === 'swarmer') {
    const jitterX = Math.sin(time * 30 + bug.offsetTime) * 0.5;
    const jitterY = Math.cos(time * 25 + bug.offsetTime) * 0.5;
    ctx.translate(jitterX, jitterY);
  }

  ctx.rotate(bug.rotation);

  const legSwing = Math.sin(bug.walkCycle) * 0.8;

  // Apply visual definition colors
  ctx.fillStyle = bug.color || visual.primaryColor;
  ctx.strokeStyle = bug.color || visual.secondaryColor;
  ctx.lineWidth = 1;

  const scale = bug.size / 15;
  ctx.scale(scale, scale);

  // Pulsing glow for elite/alpha bugs
  if ((visual.tier === 'alpha' || visual.tier === 'elite') && !isMobile) {
    const pulse = Math.sin(time * 3) * 0.3 + 0.7;
    ctx.shadowColor = visual.glowColor;
    ctx.shadowBlur = 15 * pulse;
  }

  // Healer special effect
  const isHealer = bug.type === 'healer';
  if (isHealer && !isMobile) {
    const pulse = Math.sin(time * 2) * 0.1 + 1.5;
    ctx.save();
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, -5, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Bug body (same as existing but with enhanced colors)
  for (let i = 0; i < 3; i++) {
    const yOffset = (i - 1) * 8;
    const swing = i % 2 === 0 ? legSwing : -legSwing;

    ctx.beginPath();
    ctx.moveTo(0, yOffset);
    ctx.lineTo(-15, yOffset - 10 + swing * 10);
    ctx.lineTo(-25, yOffset + swing * 15);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, yOffset);
    ctx.lineTo(15, yOffset - 10 - swing * 10);
    ctx.lineTo(25, yOffset - swing * 15);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.ellipse(0, 5, 10, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -10, 8, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, -20, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#050505';
  ctx.beginPath(); ctx.arc(-4, -22, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -22, 3, 0, Math.PI * 2); ctx.fill();

  ctx.restore();

  // HP bar
  if (bug.maxHp > 1) {
    ctx.fillStyle = '#f00';
    ctx.fillRect(bug.x - 15, bug.y - bug.size - 10, 30, 4);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(bug.x - 15, bug.y - bug.size - 10, 30 * (bug.hp / bug.maxHp), 4);
  }
}

// Visual upgrade manifest - what's changing
export const VISUAL_UPGRADES = {
  bugShapes: 'Enhanced with 5 shape types (hex, circle, triangle, diamond, star)',
  colorPalette: '15 unique color schemes per bug type',
  glowEffects: 'Tier-based glow intensity (alpha/elite bugs have strongest)',
  trails: 'Biome-appropriate particle trails',
  deathVfx: 'Type-specific death animations (explode/dissolve/shatter/implode)',
  biomeAtmos: '6 unique atmospheric effects',
};