import { useState } from 'react';
import { Globe, Lock, Check, X } from 'lucide-react';
import { soundManager } from '../game/SoundManager';
import { biomeManager } from '../game/BiomeManager';
import { BIOMES } from '../game/BiomeConfig';

interface BiomeSelectButtonProps {
  /** Called with the selected biome ID */
  onSelect: (biomeId: string) => void;
  onClose: () => void;
}

export function BiomeSelectButton({ onSelect, onClose }: BiomeSelectButtonProps) {
  const currentBiome = biomeManager.getCurrentBiome();
  const [selected, setSelected] = useState(currentBiome.id);

  const handleConfirm = () => {
    soundManager.uiClick();
    biomeManager.setCurrentBiome(selected);
    onSelect(selected);
    onClose();
  };

  const handleSelect = (biomeId: string) => {
    if (!biomeManager.isUnlocked(biomeId)) return;
    soundManager.uiClick();
    setSelected(biomeId);
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-[70] p-4">
      <div className="max-w-md w-full bg-black/40 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display uppercase tracking-wider">Biome Select</h3>
              <p className="text-zinc-500 text-xs font-mono">Choose your dimension</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Biome list */}
        <div className="space-y-2 mb-6">
          {BIOMES.map((biome) => {
            const isUnlocked = biomeManager.isUnlocked(biome.id);
            const isSelected = selected === biome.id;

            return (
              <button
                key={biome.id}
                onClick={() => handleSelect(biome.id)}
                disabled={!isUnlocked}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
                  isSelected
                    ? 'bg-white/10 border-2 border-white/30'
                    : isUnlocked
                    ? 'bg-black/30 border border-white/5 hover:bg-white/5'
                    : 'bg-black/20 border border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Color swatch */}
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: biome.theme.coreColor }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono truncate">{biome.name}</span>
                    {!isUnlocked && <Lock className="w-3 h-3 text-zinc-500 flex-shrink-0" />}
                    {isSelected && isUnlocked && <Check className="w-3 h-3 text-cyan-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-zinc-500 font-mono truncate">{biome.description}</p>
                  {!isUnlocked && (
                    <p className="text-xs text-zinc-600 font-mono mt-0.5">
                      {biome.unlockRequirement.wavesCompleted && `Survive ${biome.unlockRequirement.wavesCompleted} waves`}
                      {biome.unlockRequirement.scoreRequired && `Score ${biome.unlockRequirement.scoreRequired.toLocaleString()} pts`}
                      {biome.unlockRequirement.prestigeLevel && `Prestige Level ${biome.unlockRequirement.prestigeLevel}`}
                    </p>
                  )}
                </div>

                {/* Difficulty */}
                <div className="flex-shrink-0 text-right">
                  <span className="text-xs font-mono text-zinc-600">x{biome.difficulty.toFixed(1)}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          onMouseEnter={() => soundManager.uiHover()}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full font-bold text-sm uppercase tracking-widest transition-all"
        >
          Enter {BIOMES.find(b => b.id === selected)?.name || 'Dimension'}
        </button>
      </div>
    </div>
  );
}
