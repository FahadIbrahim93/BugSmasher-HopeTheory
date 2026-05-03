import { useState } from 'react';
import { Zap, ArrowUp, AlertTriangle, RotateCcw } from 'lucide-react';
import { soundManager } from '../game/SoundManager';
import { saveManager } from '../game/SaveManager';

interface PrestigeScreenProps {
  /** Current score from the game (used to calculate points earned) */
  score: number;
  /** Called when player confirms prestige — PrestigeScreen handles the reset internally */
  onPrestigeComplete: () => void;
  /** Called when player declines */
  onCancel: () => void;
}

export function PrestigeScreen({ score, onPrestigeComplete, onCancel }: PrestigeScreenProps) {
  const [confirming, setConfirming] = useState(false);

  const currentLevel = saveManager.getPrestigeLevel();
  const currentPoints = saveManager.getPrestigePoints();
  const pointsToAward = Math.floor(score / 100);
  const nextLevelPoints = Math.floor(100 * Math.pow(1.5, currentLevel));
  const nextLevel = currentLevel + 1;
  const nextMultiplier = 1 + (nextLevel * 0.1);
  const currentMultiplier = 1 + (currentLevel * 0.1);

  const handlePrestige = () => {
    soundManager.init();
    soundManager.uiClick();
    saveManager.prestige(currentLevel + 1);
    soundManager.powerup();
    onPrestigeComplete();
  };

  const handleCancel = () => {
    soundManager.uiClick();
    onCancel();
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-[60] p-4">
      <div className="max-w-md w-full bg-black/40 backdrop-blur-3xl border-[0.5px] border-amber-500/30 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-16 h-16 rounded-full border border-amber-500/30 flex items-center justify-center mb-6 bg-amber-500/10">
          <Zap className="w-8 h-8 text-amber-400" />
        </div>

        <h2 className="text-3xl font-black text-white font-display mb-1 uppercase tracking-widest text-center">
          Prestige
        </h2>
        <p className="text-zinc-500 font-mono tracking-widest text-sm uppercase text-center mb-8">
          {currentLevel === 0 ? 'Initiate Reboot Sequence' : 'Ascend to Next Tier'}
        </p>

        {/* Current Status */}
        <div className="w-full bg-black/40 rounded-2xl p-4 border border-white/5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Prestige Level</span>
            <span className="text-white font-bold font-mono">P{currentLevel}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Points Banked</span>
            <span className="text-amber-400 font-bold font-mono">{currentPoints.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Current Bonus</span>
            <span className="text-cyan-400 font-bold font-mono">+{Math.round((currentMultiplier - 1) * 100)}%</span>
          </div>
        </div>

        {/* What you earn */}
        <div className="w-full bg-amber-500/10 rounded-2xl p-4 border border-amber-500/30 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-mono uppercase tracking-wider font-bold">Points to Award</span>
          </div>
          <p className="text-3xl font-black text-amber-300 font-mono text-center">
            +{pointsToAward.toLocaleString()}
          </p>
          <p className="text-zinc-500 text-xs text-center mt-1 font-mono">
            Earned from {score.toLocaleString()} points
          </p>
        </div>

        {/* What you get */}
        <div className="w-full bg-black/40 rounded-2xl p-4 border border-white/5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">After Prestige</span>
            <span className="text-white font-mono font-bold">P{nextLevel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">New Bonus</span>
            <span className="text-cyan-400 font-bold font-mono">+{Math.round((nextMultiplier - 1) * 100)}%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Points Required</span>
              <span className="text-amber-400 font-mono font-bold">{nextLevelPoints.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentPoints / nextLevelPoints) * 100)}%` }}
                />
              </div>
              <span className="text-zinc-600 text-xs font-mono whitespace-nowrap">
                {currentPoints.toLocaleString()}/{nextLevelPoints.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 w-full mb-6 text-left">
          <AlertTriangle className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
          <p className="text-zinc-600 text-xs font-mono leading-relaxed">
            Prestiging will reset your score and wave progress. Your health, radius, and turret upgrades will be reset. All other progress is preserved.
          </p>
        </div>

        {/* Actions */}
        {!confirming ? (
          <div className="w-full flex flex-col space-y-3">
            <button
              onClick={() => { soundManager.uiClick(); setConfirming(true); }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Confirm Prestige
              </span>
            </button>
            <button
              onClick={handleCancel}
              className="w-full py-3 bg-transparent border border-white/10 hover:bg-white/5 text-zinc-400 rounded-full font-medium text-sm font-mono uppercase tracking-widest transition-colors"
            >
              Continue Playing
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-mono font-bold uppercase tracking-wider">Are you sure?</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <button
              onClick={handlePrestige}
              onMouseEnter={() => soundManager.uiHover()}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Yes — Reboot System
              </span>
            </button>
            <button
              onClick={() => { soundManager.uiClick(); setConfirming(false); }}
              onMouseEnter={() => soundManager.uiHover()}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 rounded-full font-medium text-sm font-mono uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
