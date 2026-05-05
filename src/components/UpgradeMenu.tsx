// UpgradeMenu — Persistent upgrade shop
// Spend crystals on upgrades that persist between runs
import React, { useState, useCallback } from 'react';
import { upgradeSystem, UPGRADE_DEFS, UpgradeId } from '../game/UpgradeSystem';

interface UpgradeMenuProps {
  onClose?: () => void;
  score?: number;
  onUpgrade?: (type: "health" | "radius" | "turret", cost: number) => void;
  onNextWave?: () => void;
  wave?: number;
  healthLevel?: number;
  radiusLevel?: number;
  turretLevel?: number;
}

export const UpgradeMenu: React.FC<UpgradeMenuProps> = ({ onClose, onUpgrade, onNextWave, score, wave, healthLevel, radiusLevel, turretLevel, ..._rest }: UpgradeMenuProps) => { void(_rest); void(healthLevel); void(radiusLevel); void(turretLevel); void(score); void(wave);
  const [crystals, setCrystals] = useState(upgradeSystem.getCrystals());
  const [, forceRender] = useState(0);
  const handleDismiss = onNextWave ?? onClose;

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
      onUpgrade?.(id as "health" | "radius" | "turret", cost);
    }
  };

  const upgrades = upgradeSystem.getAllUpgrades();

  const totalSpent = upgrades.reduce((sum, u) => {
    // Cumulative cost = sum of costs for each level purchased
    let spent = 0;
    for (let l = 0; l < u.level; l++) {
      spent += Math.floor(u.def.baseCost * Math.pow(u.def.costMultiplier, l));
    }
    return sum + spent;
  }, 0);

  return (
    <div className="glass-panel" role="button" tabIndex={0} onKeyDown={(e) => e.key === "Escape" && handleDismiss?.()} onClick={(e) => e.target === e.currentTarget && handleDismiss?.()}>
      <div className="glass-panel rounded-2xl">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title} className="font-display">
            <span style={styles.titleIcon}>💎</span>
            UPGRADES
          </div>
          <button style={styles.closeBtn} onClick={() => handleDismiss?.()}>✕</button>
        </div>

        {/* Crystal balance */}
        <div style={styles.balanceBar}>
          <span style={styles.balanceLabel}>💎 Crystals</span>
          <span style={styles.balanceValue} className="font-mono">{crystals.toLocaleString()}</span>
        </div>

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

              {/* Level bar */}
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

              {/* Purchase button */}
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

        {wave !== undefined && <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }} className="font-mono">Wave {wave} • Score {score ?? 0} • H{healthLevel ?? 0}/R{radiusLevel ?? 0}/T{turretLevel ?? 0}</div>}

        {onNextWave && (
          <div style={styles.actionBar}>
            <button style={styles.continueBtn} onClick={() => onNextWave()}>
              Start Wave {wave ?? ''}
            </button>
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
      </div>
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
  panel: {
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    background: 'linear-gradient(145deg, #0a0f1e 0%, #111827 100%)',
    border: '1px solid rgba(0,255,204,0.2)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 40px rgba(0,255,204,0.15), 0 0 80px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: '20px',
    fontWeight: 900,
    letterSpacing: '0.15em',
    color: '#00ffcc',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textShadow: '0 0 20px rgba(0,255,204,0.5)',
  },
  titleIcon: { fontSize: '22px', textShadow: '0 0 15px rgba(0,255,204,0.6)' },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#9ca3af',
    fontSize: '14px',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  balanceBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '16px 24px 8px',
    padding: '10px 16px',
    background: 'rgba(0,255,204,0.05)',
    border: '1px solid rgba(0,255,204,0.15)',
    borderRadius: '10px',
  },
  balanceLabel: { color: '#6b7280', fontSize: '13px', fontWeight: 600 },
  balanceValue: {
    color: '#00ffcc',
    fontSize: '18px',
    fontWeight: 900,
    textShadow: '0 0 10px rgba(0,255,204,0.5)',
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
    padding: '0 24px 16px',
  },
  continueBtn: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(0,255,204,0.2)',
    background: 'linear-gradient(135deg, rgba(0,255,204,0.2), rgba(0,212,255,0.2))',
    color: '#e5fffb',
    fontSize: '14px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
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
