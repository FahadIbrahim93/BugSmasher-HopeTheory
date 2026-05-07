// Bug Sprite Renderer - Enhanced 2D rendering with shapes and effects
import { Bug } from '../GameEngine';
import { getBugVisual, BugVisualDefinition } from '../assets/bugs/BugVisualDefinitions';

export class BugSpriteRenderer {
  private ctx: CanvasRenderingContext2D;
  private time: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  renderBug(bug: Bug, elapsedTime: number = 0) {
    const visual = getBugVisual(bug.type);

    // Update time for animations
    this.time = elapsedTime;

    // Draw the bug with enhanced visuals
    this.drawBugShape(bug, visual);
    this.drawBugEyes(bug, visual);
    this.drawBugGlow(bug, visual);
    this.drawBugTrail(bug, visual);
  }

  private drawBugShape(bug: Bug, visual: BugVisualDefinition) {
    const ctx = this.ctx;
    const x = bug.x;
    const y = bug.y;
    const size = visual.size * (bug.size || 1);

    ctx.save();
    ctx.translate(x, y);

    // Apply color based on mode
    let fillStyle = visual.primaryColor;
    if (visual.colorMode === 'pulse') {
      const pulse = 0.5 + Math.sin(this.time * 3 + bug.offsetTime) * 0.2;
      fillStyle = this.adjustBrightness(visual.primaryColor, pulse);
    } else if (visual.colorMode === 'cycle') {
      // Cycle through colors
      const colors = [visual.primaryColor, visual.secondaryColor];
      const idx = Math.floor(this.time * 2) % colors.length;
      fillStyle = colors[idx];
    }

    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = visual.secondaryColor;
    ctx.lineWidth = visual.tier === 'alpha' ? 3 : 1;

    // Draw shape based on visual definition
    ctx.beginPath();
    switch (visual.shape) {
      case 'hex':
        this.drawHexagon(0, 0, size);
        break;
      case 'triangle':
        this.drawTriangle(0, 0, size);
        break;
      case 'diamond':
        this.drawDiamond(0, 0, size);
        break;
      case 'star':
        this.drawStar(0, 0, size, 5);
        break;
      default:
        ctx.arc(0, 0, size, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawHexagon(x: number, y: number, size: number) {
    const ctx = this.ctx;
    ctx.moveTo(x, y - size);
    for (let i = 1; i < 7; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.lineTo(x + size * Math.sin(angle), y - size * Math.cos(angle));
    }
  }

  private drawTriangle(x: number, y: number, size: number) {
    const ctx = this.ctx;
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.866, y + size * 0.5);
    ctx.lineTo(x + size * 0.866, y + size * 0.5);
    ctx.closePath();
  }

  private drawDiamond(x: number, y: number, size: number) {
    const ctx = this.ctx;
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
  }

  private drawStar(x: number, y: number, size: number, points: number) {
    const ctx = this.ctx;
    const outer = size;
    const inner = size * 0.5;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = (i * Math.PI) / points;
      const px = x + radius * Math.sin(angle);
      const py = y - radius * Math.cos(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  private drawBugEyes(bug: Bug, visual: BugVisualDefinition) {
    const ctx = this.ctx;
    const x = bug.x;
    const y = bug.y;
    const size = visual.size * 0.25;

    ctx.save();
    ctx.translate(x, y);

    // Position eyes based on rotation
    const angle = bug.rotation || 0;
    const eyeX = Math.cos(angle) * visual.size * 0.25;
    const eyeY = Math.sin(angle) * visual.size * 0.25;

    ctx.fillStyle = visual.eyeColor;
    ctx.beginPath();
    ctx.arc(eyeX - size, eyeY, size * 0.6, 0, Math.PI * 2);
    ctx.arc(eyeX + size, eyeY, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawBugGlow(bug: Bug, visual: BugVisualDefinition) {
    const ctx = this.ctx;
    const x = bug.x;
    const y = bug.y;
    const size = visual.size;

    // Pulsing glow for certain bug types
    if (visual.colorMode === 'pulse' || visual.tier === 'alpha') {
      const pulse = 0.5 + Math.sin(this.time * 3) * 0.3;
      const gradient = ctx.createRadialGradient(x, y, size * 0.5, x, y, size * 2);
      gradient.addColorStop(0, visual.glowColor + '88');
      gradient.addColorStop(1, visual.glowColor + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * (1.5 + pulse), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawBugTrail(bug: Bug, visual: BugVisualDefinition) {
    if (!visual.trailEnabled || !visual.trailColor) return;

    // Trail is drawn in ParticleSystem for performance
  }

  private adjustBrightness(color: string, factor: number): string {
    // Simple brightness adjustment
    const r = Math.floor(parseInt(color.slice(1, 3), 16) * factor);
    const g = Math.floor(parseInt(color.slice(3, 5), 16) * factor);
    const b = Math.floor(parseInt(color.slice(5, 7), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
