import { Lock, Unlock } from 'lucide-react';
import { BIOMES } from '../game/BiomeConfig';
import { biomeManager } from '../game/BiomeManager';

interface BiomeSelectorProps {
  onSelectBiome: (biomeId: string) => void;
  currentBiomeId: string;
}

export function BiomeSelector({ onSelectBiome, currentBiomeId }: BiomeSelectorProps) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/5">
      <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3">Biomes</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 stagger-enter">
        {BIOMES.map((biome, index) => {
          const isUnlocked = biomeManager.isUnlocked(biome.id);
          const req = biome.unlockRequirement;
          
          return (
            <button
              key={biome.id}
              onClick={() => isUnlocked && onSelectBiome(biome.id)}
              disabled={!isUnlocked}
              className={`biome-card relative p-4 rounded-lg border transition-all animate-slide-up ${
                biome.id === currentBiomeId
                  ? 'border-white/40 bg-white/15 shadow-lg'
                  : isUnlocked
                  ? 'border-white/10 hover:border-white/25 bg-black/20 hover:bg-black/30 hover:shadow-md'
                  : 'border-white/5 bg-black/10 opacity-50'
              }`}
              style={{
                '--biome-color': biome.theme.coreColor,
                '--biome-glow': biome.theme.coreGlow,
                animationDelay: `${index * 100}ms`,
              } as React.CSSProperties}
            >
              {/* Accent color indicator bar */}
              <div 
                className="absolute top-0 left-2 right-2 h-1 rounded-full opacity-80"
                style={{ 
                  backgroundColor: biome.theme.coreColor,
                  boxShadow: `0 0 12px ${biome.theme.coreGlow}`
                }}
              />
              
              {/* Accent corner decoration */}
              <div 
                className="absolute top-1 right-1 w-3 h-3 rounded-full opacity-40"
                style={{ backgroundColor: biome.theme.coreColor }}
              />
              
              <div className="flex items-center justify-center mb-2 mt-1">
                {isUnlocked ? (
                  <Unlock 
                    className="w-5 h-5 transition-transform group-hover:scale-110" 
                    style={{ color: biome.theme.coreColor }} 
                  />
                ) : (
                  <Lock className="w-5 h-5 text-zinc-600" />
                )}
              </div>
              
              <div 
                className="text-sm font-semibold mb-2 transition-colors"
                style={{ color: isUnlocked ? biome.theme.coreColor : 'inherit' }}
              >
                {biome.name}
              </div>
              
              {/* Difficulty multiplier - more prominent */}
              {isUnlocked && (
                <div 
                  className="text-xs font-bold mb-1 px-2 py-1 rounded inline-block"
                  style={{ 
                    backgroundColor: `${biome.theme.coreColor}20`,
                    color: biome.theme.coreColor,
                    border: `1px solid ${biome.theme.coreColor}40`
                  }}
                >
                  x{biome.gameplay.difficultyMultiplier.toFixed(1)} Difficulty
                </div>
              )}
              
              {/* Special effect description - clearer */}
              <div className="mt-2 text-[11px] leading-relaxed">
                {isUnlocked ? (
                  biome.gameplay.specialEffect !== 'none' ? (
                    <div 
                      className="px-2 py-1.5 rounded bg-black/30 border border-white/5"
                    >
                      <div className="text-zinc-400 text-[9px] uppercase tracking-wide mb-0.5">Special Effect</div>
                      <div 
                        className="font-medium"
                        style={{ color: biome.theme.coreColor }}
                      >
                        {biome.gameplay.specialDesc}
                      </div>
                    </div>
                  ) : (
                    <div className="text-zinc-600 text-[10px] italic">
                      No special effect
                    </div>
                  )
                ) : (
                  <div className="text-zinc-500 text-[10px]">
                    <span className="text-zinc-400">Unlock: </span>
                    {req.wavesCompleted && <span className="text-zinc-300">W{req.wavesCompleted}</span>}
                    {req.scoreRequired && <span className="text-zinc-300"> {(req.scoreRequired / 1000).toFixed(0)}k score</span>}
                    {req.prestigeLevel && <span className="text-zinc-300"> P{req.prestigeLevel}</span>}
                  </div>
                )}
              </div>
              
              {/* Current selection indicator */}
              {biome.id === currentBiomeId && (
                <>
                  <div 
                    className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
                    style={{ 
                      backgroundColor: '#22c55e',
                      boxShadow: '0 0 8px #22c55e'
                    }}
                  />
                  <div 
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ 
                      boxShadow: `inset 0 0 20px ${biome.theme.coreGlow}`,
                      border: `2px solid ${biome.theme.coreColor}`
                    }}
                  />
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BiomeSelectButton({ 
  currentBiome, 
  onClick 
}: { 
  currentBiome: string; 
  onClick: () => void;
}) {
  const biome = biomeManager.getBiomeById(currentBiome);
  if (!biome) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-colors"
    >
      <div 
        className="w-3 h-3 rounded-full" 
        style={{ 
          backgroundColor: biome.theme.coreColor,
          boxShadow: `0 0 8px ${biome.theme.coreGlow}`
        }} 
      />
      <span className="text-xs text-zinc-400 font-medium">{biome.name}</span>
    </button>
  );
}
