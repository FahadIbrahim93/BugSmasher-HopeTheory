import { useEffect, useRef, useState } from 'react';
import { Shield, Target, Zap, Pause, Play, Flame, Diamond, Globe, Trophy } from 'lucide-react';
import { soundManager } from '../game/SoundManager';
import { authManager } from '../game/database/AuthManager';
import { PrestigeDisplay, DailyChallengeBadge } from './PrestigeDisplay';
import { BiomeSelectButton } from './BiomeSelectButton';
import type { Profile } from '../game/database/types';

export function HUD({ engineRef, onPauseToggle, isPaused = false }: { engineRef: React.RefObject<any>, onPauseToggle?: () => void, isPaused?: boolean }) {
  const scoreRef = useRef<HTMLSpanElement>(null);
  const waveRef = useRef<HTMLSpanElement>(null);
  const healthTextRef = useRef<HTMLSpanElement>(null);
  const healthBarRef = useRef<HTMLDivElement>(null);
  const shieldIconRef = useRef<SVGSVGElement>(null);
  const comboRef = useRef<HTMLDivElement>(null);
  const comboTextRef = useRef<HTMLSpanElement>(null);
  const comboTimerRef = useRef<number | null>(null);
  const xpBarRef = useRef<HTMLDivElement>(null);
  const levelTextRef = useRef<HTMLSpanElement>(null);
  const crystalTextRef = useRef<HTMLSpanElement>(null);
  const levelUpRef = useRef<HTMLDivElement>(null);
  const levelUpTimerRef = useRef<number | null>(null);
  const [showBiomeSelect, setShowBiomeSelect] = useState(false);
  const [showMetaPanel, setShowMetaPanel] = useState(false);

  // Subscribe to auth profile changes for XP/level/crystals
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    const update = () => setProfile(authManager.getProfile());
    update();
    return authManager.subscribe(update);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let lastScore = -1;
    let displayedScore = 0;
    let lastWave = -1;
    let lastHealth = -1;
    let lastMaxHealth = -1;
    let lastCombo = -1;
        let lastLevel = -1;

    const updateHUD = () => {
      const engine = engineRef.current;
      const prof = profile;

      if (engine) {
        if (scoreRef.current) {
          if (engine.score < displayedScore) {
            displayedScore = engine.score;
          }
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
          healthBarRef.current.className = `h-full transition-all duration-300 ${healthPercent > 50 ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : healthPercent > 20 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'}`;
          shieldIconRef.current.setAttribute('class', `lucide lucide-shield w-3.5 h-3.5 sm:w-4 sm:h-4 ${healthPercent > 50 ? 'text-cyan-400' : healthPercent > 20 ? 'text-yellow-400' : 'text-red-500 animate-pulse'}`);
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
              comboRef.current.style.transform = 'scale(1.15)';
              if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
              comboTimerRef.current = window.setTimeout(() => {
                if (comboRef.current) {
                  comboRef.current.style.transform = 'scale(1)';
                  comboRef.current.classList.add('animate-pulse-combo');
                }
              }, 100);
            } else {
              comboRef.current.style.opacity = '0';
              comboRef.current.style.transform = 'scale(0.9)';
              comboRef.current.classList.remove('animate-pulse-combo');
            }
          }
        }

        // Level-up detection
        if (engine.onLevelUp) {
          const origCB = engine.onLevelUp;
          engine.onLevelUp = (newLevel: number, crystalReward: number) => {
            if (levelUpRef.current) {
              levelUpRef.current.style.opacity = '1';
              levelUpRef.current.style.transform = 'scale(1.2)';
              if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
              levelUpTimerRef.current = window.setTimeout(() => {
                if (levelUpRef.current) {
                  levelUpRef.current.style.opacity = '0';
                  levelUpRef.current.style.transform = 'scale(0.8)';
                }
              }, 1500);
            }
            origCB(newLevel, crystalReward);
          };
        }
      }

      // Profile-based XP bar
      if (prof) {
        const level = prof.level;
        const xp = prof.xp;
        const xpForLevel = 100 * level;
        const xpPercent = Math.min(100, (xp / xpForLevel) * 100);

        if (xpBarRef.current) {
          xpBarRef.current.style.width = `${xpPercent}%`;
        }
        if (levelTextRef.current) {
          levelTextRef.current.textContent = `LVL ${level}`;
        }
        if (crystalTextRef.current) {
          crystalTextRef.current.textContent = `${prof.crystals}`;
        }

        // Level-up flash when level changes
        if (level !== lastLevel && lastLevel !== -1 && level > lastLevel) {
          if (levelUpRef.current) {
            levelUpRef.current.style.opacity = '1';
            levelUpRef.current.style.transform = 'scale(1.2)';
            if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
            levelUpTimerRef.current = window.setTimeout(() => {
              if (levelUpRef.current) {
                levelUpRef.current.style.opacity = '0';
                levelUpRef.current.style.transform = 'scale(0.8)';
              }
            }, 2000);
          }
        }
        lastLevel = level;
      }

      animationFrameId = requestAnimationFrame(updateHUD);
    };

    updateHUD();
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
    };
  }, [engineRef, profile]);

  return (
    <>
      {showBiomeSelect && (
        <BiomeSelectButton
          onSelect={() => setShowBiomeSelect(false)}
          onClose={() => setShowBiomeSelect(false)}
        />
      )}
      <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-start pointer-events-none z-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {/* Left column */}
        <div className="flex flex-col space-y-2 sm:space-y-3 pointer-events-none">
          <div className="flex items-center space-x-2 sm:space-x-3 bg-black/20 backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-[0.5px] border-white/10 shadow-[0_4_20px_rgba(0,0,0,0.5)] pointer-events-none">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
            <span className="text-zinc-500 font-medium text-xs sm:text-sm tracking-wider uppercase">Score</span>
            <span ref={scoreRef} className="hud-score pl-1 pointer-events-none">000000</span>
            <Diamond className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 ml-2" />
            <span ref={crystalTextRef} className="text-sm sm:text-base font-bold font-mono text-cyan-300 pointer-events-none">
              {profile?.crystals ?? 0}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 bg-black/20 backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-[0.5px] border-white/10 shadow-[0_4_20px_rgba(0,0,0,0.5)] pointer-events-none">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
            <span ref={waveRef} className="wave-banner text-glow-sm text-sm sm:text-base font-medium font-mono text-white uppercase tracking-widest pointer-events-none">WAVE 1</span>
          </div>

          {/* XP Bar */}
          <div className="bg-black/20 backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-[0.5px] border-cyan-500/20 shadow-[0_4_20px_rgba(0,0,0,0.5)] pointer-events-none min-w-[180px] sm:min-w-[240px]">
            <div className="flex items-center justify-between mb-1.5">
              <span ref={levelTextRef} className="text-xs sm:text-sm font-bold font-mono text-cyan-300 uppercase tracking-wider">
                LVL {profile?.level ?? 1}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {profile ? `${profile.xp}/${100 * profile.level} XP` : '0/100 XP'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div
                ref={xpBarRef}
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full transition-all duration-300"
                style={{ width: profile ? `${Math.min(100, (profile.xp / (100 * profile.level)) * 100)}%` : '0%' }}
              />
            </div>
          </div>

          {/* Level-up flash */}
          <div
            ref={levelUpRef}
            className="flex items-center justify-center bg-cyan-500/20 border border-cyan-400/50 rounded-full px-3 py-1 transition-all duration-300"
            style={{ opacity: 0, transform: 'scale(0.8)' }}
          >
            <Zap className="w-3 h-3 text-cyan-300 animate-pulse mr-1" />
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Level Up!</span>
            <Diamond className="w-3 h-3 text-cyan-300 ml-1" />
          </div>

          {/* Combo */}
          <div
            ref={comboRef}
            className="flex items-center space-x-2 bg-black/20 backdrop-blur-xl px-4 py-1.5 rounded-full border-[0.5px] border-cyan-500/30 shadow-[0_4_20px_rgba(0,0,0,0.5)] transition-all duration-200 pointer-events-none animate-pulse-combo"
            style={{ opacity: 0 }}
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold font-mono text-cyan-300 uppercase tracking-wider">
              COMBO <span className="text-white">x<span ref={comboTextRef}>0</span></span>
            </span>
          </div>

          <div className="pointer-events-auto self-start">
            <button
              onClick={() => {
                soundManager.uiClick();
                setShowMetaPanel((prev) => !prev);
              }}
              className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-black/15 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-200 backdrop-blur-md transition-all hover:bg-cyan-500/10"
              aria-label={showMetaPanel ? 'Hide meta info' : 'Show meta info'}
            >
              <Trophy className="h-3.5 w-3.5 text-cyan-300" />
              Meta
            </button>

            {showMetaPanel && (
              <div className="mt-2 flex max-w-[260px] flex-col space-y-2 rounded-2xl border border-white/10 bg-black/25 p-2 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                <PrestigeDisplay />
                <DailyChallengeBadge />
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col space-y-2 sm:space-y-3 items-end">
          <div className="flex items-center gap-2">
            {/* Biome select button */}
            <button
              onClick={() => { soundManager.uiClick(); setShowBiomeSelect(true); }}
              className="flex items-center justify-center bg-black/20 backdrop-blur-xl p-2 sm:p-2.5 rounded-full border border-cyan-500/30 hover:bg-cyan-500/10 hover:scale-105 active:scale-95 transition-all shadow-[0_4_20px_rgba(0,0,0,0.5)] z-50"
              aria-label="Select Biome"
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </button>

            {/* Pause button */}
            <button
              onClick={() => { soundManager.uiClick(); onPauseToggle?.(); }}
              className="flex items-center justify-center bg-black/20 backdrop-blur-xl p-2 sm:p-2.5 rounded-full border-[0.5px] border-white/10 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all shadow-[0_4_20px_rgba(0,0,0,0.5)] z-50"
              aria-label={isPaused ? "Resume Game" : "Pause Game"}
            >
              {isPaused ? <Play className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />}
            </button>
          </div>

          {/* Health bar */}
          <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-[0.5px] border-white/10 shadow-[0_4_20px_rgba(0,0,0,0.5)] pointer-events-none">
            <Shield ref={shieldIconRef} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
            <div className="w-20 sm:w-32 h-1.5 sm:h-2 bg-zinc-900 rounded-full overflow-hidden pointer-events-none">
              <div
                ref={healthBarRef}
                className="h-full transition-all duration-300 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                style={{ width: '100%' }}
              />
            </div>
            <span ref={healthTextRef} className="text-sm sm:text-lg font-bold text-white font-mono w-8 text-right pointer-events-none">100</span>
          </div>
        </div>
      </div>
    </>
  );
}
