import { useEffect, useRef } from 'react';
import { Shield, Target, Zap, Pause, Play, Flame } from 'lucide-react';
import { soundManager } from '../game/SoundManager';

export function HUD({ engineRef, onPauseToggle, isPaused = false }: { engineRef: React.RefObject<any>, onPauseToggle?: () => void, isPaused?: boolean }) {
  const scoreRef = useRef<HTMLSpanElement>(null);
  const waveRef = useRef<HTMLSpanElement>(null);
  const healthTextRef = useRef<HTMLSpanElement>(null);
  const healthBarRef = useRef<HTMLDivElement>(null);
  const shieldIconRef = useRef<SVGSVGElement>(null);
  const comboRef = useRef<HTMLDivElement>(null);
  const comboTextRef = useRef<HTMLSpanElement>(null);
  const comboTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let lastScore = -1;
    let displayedScore = 0;
    let lastWave = -1;
    let lastHealth = -1;
    let lastMaxHealth = -1;
    let lastCombo = -1;

    const updateHUD = () => {
      const engine = engineRef.current;
      if (engine) {
        if (scoreRef.current) {
          // Reset displayed score when new game starts
          if (engine.score < displayedScore) {
            displayedScore = engine.score;
          }

          // Smooth score fly-to animation
          const delta = engine.score - displayedScore;
          if (Math.abs(delta) > 0.5) {
            displayedScore += delta * 0.2;
          } else {
            displayedScore = engine.score;
          }

          scoreRef.current.textContent = Math.floor(displayedScore).toString().padStart(6, '0');
          if (engine.score !== lastScore && lastScore !== -1 && engine.score > lastScore) {
            soundManager.scoreTick();
          }
          lastScore = engine.score;
        }
        
        if (engine.wave !== lastWave && waveRef.current) {
          waveRef.current.textContent = `WAVE ${engine.wave}`;
          lastWave = engine.wave;
        }

        if (healthTextRef.current && healthBarRef.current && shieldIconRef.current && (engine.health !== lastHealth || engine.maxHealth !== lastMaxHealth)) {
          const healthPercent = Math.max(0, Math.min(100, (engine.health / engine.maxHealth) * 100));
          healthTextRef.current.textContent = Math.ceil(engine.health).toString();
          
          healthBarRef.current.style.width = `${healthPercent}%`;
          
          // Class updates for health colors
          healthBarRef.current.className = `h-full transition-all duration-300 ${healthPercent > 50 ? 'bg-white' : healthPercent > 20 ? 'bg-yellow-400' : 'bg-red-500'}`;
          shieldIconRef.current.setAttribute('class', `lucide lucide-shield w-3.5 h-3.5 sm:w-4 sm:h-4 ${healthPercent > 50 ? 'text-zinc-400' : healthPercent > 20 ? 'text-yellow-400' : 'text-red-500 animate-pulse'}`);

          lastHealth = engine.health;
          lastMaxHealth = engine.maxHealth;
        }

        // Combo tracking
        const combo = engine.chainCombo || 0;
        if (comboRef.current && comboTextRef.current) {
          if (combo !== lastCombo) {
            lastCombo = combo;
            if (combo >= 2) {
              comboTextRef.current.textContent = combo.toString();
              comboRef.current.style.opacity = '1';
              // Scale pop animation
              comboRef.current.style.transform = 'scale(1.15)';
              if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
              comboTimerRef.current = window.setTimeout(() => {
                if (comboRef.current) comboRef.current.style.transform = 'scale(1)';
              }, 100);
            } else {
              comboRef.current.style.opacity = '0';
              comboRef.current.style.transform = 'scale(0.9)';
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(updateHUD);
    };

    updateHUD();
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (comboTimerRef.current) {
        clearTimeout(comboTimerRef.current);
      }
    };
  }, [engineRef]);

  return (
    <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-start pointer-events-none z-10">
      <div className="flex flex-col space-y-2 sm:space-y-4 pointer-events-none">
        <div className="flex items-center space-x-2 sm:space-x-3 bg-black/20 backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-[0.5px] border-white/10 shadow-[0_4_20px_rgba(0,0,0,0.5)] pointer-events-none">
          <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
          <span className="text-zinc-500 font-medium text-xs sm:text-sm tracking-wider uppercase">Score</span>
          <span ref={scoreRef} className="text-lg sm:text-xl font-bold font-mono text-white tracking-widest pl-1 pointer-events-none">000000</span>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 bg-black/20 backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-[0.5px] border-white/10 shadow-[0_4_20px_rgba(0,0,0,0.5)] pointer-events-none">
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
          <span ref={waveRef} className="text-sm sm:text-base font-medium font-mono text-white uppercase tracking-widest pointer-events-none">WAVE 1</span>
        </div>
        
        <div 
          ref={comboRef}
          className="flex items-center space-x-2 bg-black/20 backdrop-blur-xl px-4 py-1.5 rounded-full border-[0.5px] border-cyan-500/30 shadow-[0_4_20px_rgba(0,0,0,0.5)] transition-all duration-200 pointer-events-none"
          style={{ opacity: 0 }}
        >
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold font-mono text-cyan-300 uppercase tracking-wider pointer-events-none">
            COMBO <span className="text-white">x<span ref={comboTextRef}>0</span></span>
          </span>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2 sm:space-y-4 items-end">
        <button 
          onClick={() => { soundManager.uiClick(); onPauseToggle?.(); }}
          className="flex items-center justify-center bg-black/20 backdrop-blur-xl p-2 sm:p-2.5 rounded-full border-[0.5px] border-white/10 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all shadow-[0_4_20px_rgba(0,0,0,0.5)] z-50"
          aria-label={isPaused ? "Resume Game" : "Pause Game"}
        >
          {isPaused ? <Play className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />}
        </button>
        
        <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-[0.5px] border-white/10 shadow-[0_4_20px_rgba(0,0,0,0.5)] pointer-events-none">
          <Shield ref={shieldIconRef} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
          <div className="w-20 sm:w-32 h-1.5 sm:h-2 bg-zinc-900 rounded-full overflow-hidden pointer-events-none">
            <div 
              ref={healthBarRef}
              className="h-full transition-all duration-300 bg-white"
              style={{ width: '100%' }}
            />
          </div>
          <span ref={healthTextRef} className="text-sm sm:text-lg font-bold text-white font-mono w-8 text-right pointer-events-none">100</span>
        </div>
      </div>
    </div>
  );
}
