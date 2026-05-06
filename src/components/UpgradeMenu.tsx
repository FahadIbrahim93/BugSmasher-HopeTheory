// UpgradeMenu — Persistent upgrade shop
// Spend crystals on upgrades that persist between runs
import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, Variants } from 'motion/react';
import { soundManager } from '../game/SoundManager';
import { upgradeSystem, UPGRADE_DEFS, UpgradeId } from '../game/UpgradeSystem';

interface UpgradeMenuProps {
  score?: number;
  onUpgrade?: (type: 'health' | 'radius' | 'turret', cost: number) => void;
  onNextWave?: () => void;
  onClose: () => void;
  wave?: number;
  healthLevel?: number;
  radiusLevel?: number;
  turretLevel?: number;
}

export const UpgradeMenu: React.FC<UpgradeMenuProps> = ({ 
  score = 0, 
  onUpgrade = () => {}, 
  onNextWave, 
  onClose, 
  wave = 1,
  healthLevel = 0,
  radiusLevel = 0,
  turretLevel = 0
}) => {
  const [crystals, setCrystals] = useState(upgradeSystem.getCrystals());
  const [, forceRender] = useState(0);

  const handleClose = () => {
    soundManager.init();
    soundManager.uiClick();
    onClose();
  };

  const handleWaveContinue = onNextWave ?? onClose;

  const refresh = useCallback(() => {
    setCrystals(upgradeSystem.getCrystals());
    forceRender(n => n + 1);
  }, []);

  const handlePurchase = (id: UpgradeId) => {
    const def = UPGRADE_DEFS.find(d => d.id === id);
    if (!def) return;

    if (upgradeSystem.isMaxed(id)) return;

    const cost = upgradeSystem.getUpgradeCost(id);
    if (upgradeSystem.spendCrystals(cost)) {
      refresh();
      onUpgrade(id as 'health' | 'radius' | 'turret', cost);
    }
  };

  const upgrades = upgradeSystem.getAllUpgrades();

  const totalSpent = upgrades.reduce((sum, u) => {
    let spent = 0;
    for (let l = 0; l < u.level; l++) {
      spent += Math.floor(u.def.baseCost * Math.pow(u.def.costMultiplier, l));
    }
    return sum + spent;
  }, 0);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleHover = () => {
    soundManager.init();
    soundManager.uiHover();
  };

  const isWaveUpgrade = onNextWave !== undefined;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-[70] p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full text-center my-auto relative"
      >
        <button
          onClick={handleClose}
          aria-label={isWaveUpgrade ? "Close upgrades and continue to next wave" : "Close upgrades"}
          className="absolute top-0 right-0 -mt-2 sm:-mt-4 bg-black/40 hover:bg-white/10 border border-white/15 rounded-full p-2.5 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-300" />
        </button>
        
        {isWaveUpgrade ? (
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white font-display mb-4 uppercase tracking-widest">
              WAVE {wave - 1} CLEARED
            </h2>
            <p className="text-zinc-400 font-mono">
              Score: {score.toLocaleString()} • Crystals: {crystals.toLocaleString()}
            </p>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white font-display mb-4 uppercase tracking-widest">
              UPGRADES
            </h2>
            <p className="text-zinc-400 font-mono">
              💎 {crystals.toLocaleString()} crystals available
            </p>
          </motion.div>
        )}

        {/* Upgrades grid */}
        <div className="stagger-enter animate-slide-up" style={styles.grid}>
          {upgrades.map(({ def, level, cost, totalBonus, isMaxed, canAfford }) => (
            <div
              key={def.id}
              className="upgrade-card"
              style={{
                ...styles.card,
                ...(isMaxed ? styles.cardMaxed : canAfford ? styles.cardAffordable : styles.cardLocked),
              }}
            >
              <div style={styles.cardTop}>
                <span style={styles.cardIcon}>{def.icon}</span>
                <div style={styles.cardInfo}>
                  <div style={styles.cardName}>{def.name}</div>
                  <div style={styles.cardDesc}>{def.description}</div>
                </div>
              </div>

              <div style={styles.levelBar}>
                <div
                  className="bar-fill"
                  style={{
                    ...styles.levelFill,
                    width: `${(level / def.maxLevel) * 100}%`,
                    background: isMaxed
                      ? 'linear-gradient(90deg, #ffd700, #ff8c00)'
                      : 'linear-gradient(90deg, #00ffcc, #00d4ff)',
                  }}
                />
              </div>
              <div style={styles.levelText} className="font-mono">
                Lv {level} / {def.maxLevel}
                {!isMaxed && (
                  <span style={styles.bonusText}>
                    → {def.effectPerLevel > 1 ? '+' : ''}{totalBonus}{def.unit}
                  </span>
                )}
                {isMaxed && (
                  <span style={{ color: '#ffd700' }}> ★ MAX</span>
                )}
              </div>

              {!isMaxed && (
                <button
                  style={{
                    ...styles.buyBtn,
                    ...(canAfford ? styles.buyBtnActive : styles.buyBtnDisabled),
                  }}
                  onClick={() => handlePurchase(def.id)}
                  disabled={!canAfford}
                >
                  <span className="font-mono">💎 {cost.toLocaleString()}</span>
                  {!canAfford && (
                    <span style={styles.needMore} className="font-mono">
                      {cost > crystals ? `Need ${(cost - crystals).toLocaleString()} more` : 'Max level'}
                    </span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {isWaveUpgrade && onNextWave && (
          <div style={styles.actionBar}>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleClose}
                onMouseEnter={handleHover}
                aria-label={`Close upgrades and start Wave ${wave}`}
                className="group relative px-8 py-4 bg-transparent border-[0.5px] border-white/20 text-zinc-300 font-bold text-xs hover:bg-white/10 hover:text-white rounded-full hover:scale-105 active:scale-95 transition-all tracking-widest uppercase overflow-hidden"
              >
                <span className="relative z-10">Skip Upgrades</span>
              </button>
              <button
                onClick={onNextWave}
                onMouseEnter={handleHover}
                aria-label={`Start Wave ${wave}`}
                className="group relative px-12 py-5 bg-transparent border-[0.5px] border-white/30 text-white font-bold text-sm hover:bg-white hover:text-black rounded-full hover:scale-105 active:scale-95 transition-all tracking-widest uppercase overflow-hidden"
              >
                <span className="relative z-10">Proceed to Wave {wave}</span>
              </button>
            </div>
          </div>
        )}

        {/* Stats footer */}
        <div style={styles.footer}>
          <span style={styles.footerStat} className="font-mono">
            💎 {totalSpent.toLocaleString()} total invested
          </span>
          <span style={styles.footerStat}>
            ⚡ {upgrades.filter(u => u.level > 0).length} / {upgrades.length} unlocked
          </span>
        </div>
      </motion.div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px',
    padding: '12px 24px 16px',
    overflowY: 'auto',
    flex: 1,
  },
  card: {
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'all 0.2s',
  },
  cardAffordable: {
    background: 'rgba(0,255,204,0.05)',
    borderColor: 'rgba(0,255,204,0.25)',
  },
  cardLocked: {
    background: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardMaxed: {
    background: 'rgba(255,215,0,0.06)',
    borderColor: 'rgba(255,215,0,0.3)',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  cardIcon: {
    fontSize: '28px',
    lineHeight: 1,
    flexShrink: 0,
    textShadow: '0 0 12px rgba(0,255,204,0.4)',
  },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#f3f4f6',
    letterSpacing: '0.02em',
  },
  cardDesc: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '2px',
  },
  levelBar: {
    height: '4px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  levelText: {
    fontSize: '11px',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  bonusText: {
    color: '#00ffcc',
    fontWeight: 600,
  },
  buyBtn: {
    width: '100%',
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    transition: 'all 0.2s',
  },
  buyBtnActive: {
    background: 'linear-gradient(135deg, #00ffcc, #00d4ff)',
    color: '#0a0f1e',
    boxShadow: '0 0 12px rgba(0,255,204,0.3)',
  },
  buyBtnDisabled: {
    background: 'rgba(255,255,255,0.04)',
    color: '#6b7280',
    cursor: 'not-allowed',
  },
  needMore: {
    fontSize: '10px',
    fontWeight: 400,
    opacity: 0.7,
  },
  actionBar: {
    padding: '24px 24px 16px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(0,0,0,0.2)',
  },
  footerStat: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500,
  },
};

export default UpgradeMenu;