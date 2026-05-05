/**
 * DeathCardGenerator — Canvas-based shareable death card for BugSmasher
 *
 * Generates a 1200x630 Open Graph / Twitter card image with:
 * - Biome-themed background gradient
 * - Score, wave, kills, time, rank stats
 * - BugSmasher branding
 *
 * Usage:
 *   const blob = await generateDeathCardBlob({ score, waves, kills, playTime, biomeId, rank });
 *   // then share via navigator.share() or download
 */

import { BIOMES } from './BiomeConfig';

export interface DeathCardData {
  score: number;
  waves: number;
  kills: number;
  playTimeSeconds: number;
  biomeId: string;
  rank?: number;
}

interface BiomeTheme {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  bgGradientEnd: string;
}

function getBiomeTheme(biomeId: string): BiomeTheme {
  const biome = BIOMES.find(b => b.id === biomeId) ?? BIOMES[0];
  const c = biome.theme.coreColor;
  const base = biome.theme.background;
  return {
    primary: c,
    secondary: `${c}cc`,
    accent: '#ffffff',
    bg: base,
    bgGradientEnd: `${c}22`,
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

/**
 * Generate a shareable death card image blob.
 * Returns PNG blob — pass to navigator.share() or create object URL.
 */
export async function generateDeathCardBlob(data: DeathCardData): Promise<Blob> {
  const W = 1200;
  const H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const theme = getBiomeTheme(data.biomeId);

  // ── Background ────────────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, theme.bg);
  bgGrad.addColorStop(0.5, theme.bgGradientEnd);
  bgGrad.addColorStop(1, theme.bg);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Grid lines (subtle)
  ctx.strokeStyle = hexToRgba(theme.primary, 0.07);
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // ── Header bar ────────────────────────────────────────────────────────────
  ctx.fillStyle = hexToRgba(theme.primary, 0.15);
  ctx.fillRect(0, 0, W, 80);

  // BugSmasher logo text
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillStyle = theme.primary;
  ctx.textAlign = 'left';
  ctx.fillText('BUGSMASHER', 40, 52);

  // HopeTheory branding
  ctx.font = '14px "Courier New", monospace';
  ctx.fillStyle = hexToRgba(theme.primary, 0.6);
  ctx.textAlign = 'right';
  ctx.fillText('by HopeTheory', W - 40, 50);

  // Divider
  ctx.strokeStyle = hexToRgba(theme.primary, 0.3);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 80);
  ctx.lineTo(W - 40, 80);
  ctx.stroke();

  // ── Score ─────────────────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillStyle = hexToRgba(theme.primary, 0.7);
  ctx.fillText('FINAL SCORE', W / 2, 130);

  ctx.font = 'bold 96px "Courier New", monospace';
  ctx.fillStyle = theme.accent;
  // Glow
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 30;
  ctx.fillText(data.score.toLocaleString(), W / 2, 230);
  ctx.shadowBlur = 0;

  // ── Biome badge ──────────────────────────────────────────────────────────
  const biome = BIOMES.find(b => b.id === data.biomeId) ?? BIOMES[0];
  const badgeW = 200;
  const badgeH = 32;
  const badgeX = (W - badgeW) / 2;
  const badgeY = 250;
  ctx.fillStyle = hexToRgba(theme.primary, 0.2);
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 6);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(theme.primary, 0.4);
  ctx.lineWidth = 1;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 6);
  ctx.stroke();
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillStyle = theme.primary;
  ctx.textAlign = 'center';
  ctx.fillText(biome.name.toUpperCase(), W / 2, badgeY + 21);

  // ── Stats grid ─────────────────────────────────────────────────────────────
  const stats = [
    { label: 'WAVE', value: String(data.waves) },
    { label: 'BUGS SMASHED', value: data.kills.toLocaleString() },
    { label: 'TIME', value: formatTime(data.playTimeSeconds) },
    ...(data.rank ? [{ label: 'RANK', value: `#${data.rank}` }] : []),
  ];

  const colW = W / (stats.length + 1);
  const statY = 340;

  stats.forEach((stat, i) => {
    const x = colW * (i + 0.5);
    ctx.textAlign = 'center';
    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = hexToRgba(theme.primary, 0.6);
    ctx.fillText(stat.label, x, statY);

    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.fillStyle = theme.accent;
    ctx.fillText(stat.value, x, statY + 48);
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  ctx.strokeStyle = hexToRgba(theme.primary, 0.2);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, H - 60);
  ctx.lineTo(W - 40, H - 60);
  ctx.stroke();

  ctx.font = '13px "Courier New", monospace';
  ctx.fillStyle = hexToRgba(theme.primary, 0.5);
  ctx.textAlign = 'center';
  ctx.fillText('bugsmasher-ten.vercel.app', W / 2, H - 35);
  ctx.fillText('#BugSmasher #HighScore', W / 2, H - 16);

  // ── Side accents ──────────────────────────────────────────────────────────
  // Left vertical bar
  const leftGrad = ctx.createLinearGradient(0, 0, 0, H);
  leftGrad.addColorStop(0, 'transparent');
  leftGrad.addColorStop(0.3, theme.primary);
  leftGrad.addColorStop(0.7, theme.primary);
  leftGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(20, 0, 3, H);

  // Right vertical bar
  ctx.fillRect(W - 23, 0, 3, H);

  // Corner glow dots
  ctx.beginPath();
  ctx.arc(40, 40, 6, 0, Math.PI * 2);
  ctx.fillStyle = theme.primary;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(W - 40, 40, 6, 0, Math.PI * 2);
  ctx.fill();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate canvas blob'));
    }, 'image/png');
  });
}

/** Download the death card as a PNG file */
export async function downloadDeathCard(data: DeathCardData): Promise<void> {
  const blob = await generateDeathCardBlob(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bugsmasher-death-card-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Share the death card via Web Share API (falls back to download) */
export async function shareDeathCard(data: DeathCardData): Promise<boolean> {
  const blob = await generateDeathCardBlob(data);
  const file = new File([blob], 'bugsmasher-death-card.png', { type: 'image/png' });

  const text = `I scored ${data.score.toLocaleString()} points and reached Wave ${data.waves} in BugSmasher by HopeTheory! #BugSmasher #HighScore`;

  // Try native share with image
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return true;
    } catch {
      // fall through
    }
  }

  // Try text-only share
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return true;
    } catch {
      // fall through
    }
  }

  // Last resort: download
  await downloadDeathCard(data);
  return false;
}

// Helper: rounded rectangle path
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
