// MatrixRain — Animated background for main menu
// Matrix-style falling characters

import { useEffect, useRef } from 'react';

const CHAR_COLS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

export function MatrixRain({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let columns: number[] = [];
    const fontSize = 14;
    let columnsCount = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columnsCount = Math.floor(canvas.width / fontSize);
      columns = Array(columnsCount).fill(0);
    };

    const draw = () => {
      ctx.globalAlpha = 1;
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ffcc';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns.length; i++) {
        const char = CHAR_COLS[Math.floor(Math.random() * CHAR_COLS.length)];
        const x = i * fontSize;
        const y = columns[i] * fontSize;

        // Fade based on position
        const alpha = Math.min(1, (columns[i] * fontSize) / canvas.height);
        ctx.globalAlpha = alpha;
        ctx.fillText(char, x, y);

        // Reset column randomly
        if (columns[i] > canvas.height / fontSize && Math.random() > 0.975) {
          columns[i] = 0;
        }
        columns[i]++;
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  );
}