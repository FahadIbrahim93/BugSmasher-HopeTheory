import { useState, useEffect, useCallback } from 'react';
import { Skull, RotateCcw, Home, Trophy, Target, Layers, Share2, Globe, Medal, Diamond, Zap, Loader2 } from 'lucide-react';
import { leaderboardManager } from '../game/database/LeaderboardManager';
import { leaderboard } from '../game/Leaderboard';
import { saveManager } from '../game/SaveManager';
import { dailyChallengeManager } from '../game/DailyChallenge';
import { biomeManager } from '../game/BiomeManager';
import { soundManager } from '../game/SoundManager';
import { authManager } from '../game/database/AuthManager';
import { shareDeathCard } from '../game/DeathCardGenerator';
import type { LeaderboardEntry } from '../game/database/types';

interface GameOverProps {
  score: number;
  waves: number;
  kills: number;
  missCount?: number;
  playTimeSeconds?: number;
  sessionXP?: number;
  sessionCrystals?: number;
  onRetry: () => void;
  onMainMenu: () => void;
  /** Newly unlocked biome IDs from this run */
  newBiomes?: string[];
  /** Biome ID used in this run — drives death card theming */
  biomeId?: string;
}

export function GameOver({
  score,
  waves,
  kills,
  missCount = 0,
  playTimeSeconds = 0,
  sessionXP = 0,
  sessionCrystals = 0,
  onRetry,
  onMainMenu,
  biomeId = 'neon_core',
}: GameOverProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<'local' | 'global'>('local');
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [globalRank, setGlobalRank] = useState(0);
  const [rank, setRank] = useState(0);
  const [startLevel, setStartLevel] = useState(1);
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);

  const profile = authManager.getProfile();
  const currentLevel = profile?.level ?? 1;
  const levelsGained = Math.max(0, currentLevel - startLevel);

  useEffect(() => {
    const isHigh = leaderboard.isHighScore(score);
    setIsNewHighScore(isHigh);
    setRank(leaderboard.getRank(score));
    setStartLevel(authManager.getProfile()?.level ?? 1);

    if (score > 0) {
      leaderboard.addEntry(score, waves, kills, 'Player');
    }

    // Validate daily challenge with REAL missCount and playTime
    const challenge = dailyChallengeManager.getTodayChallenge();
    const completed = dailyChallengeManager.checkCompletion(
      challenge,
      score,
      kills,
      waves,
      missCount,
      playTimeSeconds
    );

    if (completed && !saveManager.hasCompletedDailyChallenge()) {
      saveManager.completeDailyChallenge();
    }

    // Check for newly unlocked biomes
    biomeManager.checkUnlocks(waves, score, saveManager.getPrestigeLevel());

    // Submit to Supabase leaderboard (gracefully falls back)
    leaderboardManager.submitScore(score, waves).then((rank) => {
      setGlobalRank(rank);
    });
  }, [score, waves, kills, missCount, playTimeSeconds]);

  // Load global leaderboard when tab is opened
  useEffect(() => {
    if (leaderboardTab === 'global' && showLeaderboard) {
      setGlobalLoading(true);
      leaderboardManager.getGlobalLeaderboard(25).then((entries) => {
        setGlobalEntries(entries);
        setGlobalLoading(false);
      });
    }
  }, [leaderboardTab, showLeaderboard]);

  const handleShare = useCallback(async () => {
    // Play click sound
    soundManager.uiClick();
    // Try to share the death card image
    try {
      await shareDeathCard({
        score,
        waves,
        kills,
        playTimeSeconds,
        biomeId,
        rank: rank > 0 ? rank : undefined,
      });
    } catch {
      // Fallback: text only
      const text = `I scored ${score.toLocaleString()} points and reached Wave ${waves} in BugSmasher by HopeTheory!\n${kills} bugs smashed\n#BugSmasher #HighScore`;
      try {
        if (navigator.share) {
          await navigator.share({ text });
        } else {
          await navigator.clipboard.writeText(text);
        }
      } catch {
        // silent fail
      }
    }
  }, [score, waves, kills, playTimeSeconds, biomeId, rank]);

  const percentileText = globalRank > 0 ? leaderboardManager.getPercentile(globalRank) : null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-50 p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-slide-scale">
        {/* Header */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 animate-pulse">
            <Skull className="w-7 h-7 text-red-500 opacity-90" />
          </div>
          <div>
            <h2 
              className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1" 
              style={{ fontFamily: '"Orbitron", sans-serif' }}
            >
              {isNewHighScore && rank === 1 ? 'NEW HIGH SCORE!' : 'SYSTEM BREACH'}
            </h2>
            <div className="h-px w-12 bg-red-500/50 mx-auto my-3" />
            <p 
              className="text-zinc-400 text-sm font-bold tracking-widest uppercase" 
              style={{ fontFamily: '"Orbitron", sans-serif' }}
            >
              Defense Array Destroyed
            </p>
          </div>
        </div>

        {/* Score Display */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-2xl space-y-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Final Score</p>
          <p className="score-display text-5xl sm:text-6xl">
            {score.toString().padStart(6, '0')}
          </p>

          {/* Percentile Badge */}
          {globalRank > 0 && (
            <div className="flex items-center justify-center gap-2 text-cyan-400 animate-pulse">
              <Medal className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Top {percentileText} Worldwide
              </span>
            </div>
          )}

          {/* Progression Summary */}
          {(sessionXP > 0 || sessionCrystals > 0) && (
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/20 shadow-2xl">
              <p className="text-xs text-cyan-400 uppercase tracking-widest font-mono mb-3 text-center">Session Rewards</p>
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-300 text-sm font-mono font-bold">+{sessionXP} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Diamond className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-300 text-sm font-mono font-bold">+{sessionCrystals} Crystals</span>
                </div>
              </div>
              {levelsGained > 0 && (
                <div className="flex justify-center mt-2">
                  <span className="text-xs text-cyan-400 font-mono">
                    {startLevel} → {currentLevel} (Level {currentLevel})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-zinc-400">
              <Layers className="w-4 h-4" />
              <span className="text-sm font-mono">Wave {waves}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Target className="w-4 h-4" />
              <span className="text-sm font-mono">{kills} kills</span>
            </div>
          </div>
        </div>

        {/* New High Score Badge */}
        {isNewHighScore && (
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">
              Rank #{rank} on Leaderboard!
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => { soundManager.init(); soundManager.uiClick(); onRetry(); }}
            onMouseEnter={() => { soundManager.init(); soundManager.uiHover(); }}
            aria-label="Play Again"
            className="btn-primary group relative w-full py-4 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <RotateCcw className="w-4 h-4 mr-3" />
              Reboot System
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => { soundManager.uiClick(); setShowLeaderboard(!showLeaderboard); }}
              className="btn-secondary flex-1 py-3 rounded-full font-medium text-xs font-mono uppercase tracking-widest flex items-center justify-center transition-colors"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </button>

            <button
              onClick={handleShare}
              className="btn-share flex-1 py-3 rounded-full font-medium text-xs font-mono uppercase tracking-widest flex items-center justify-center transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Card
            </button>

            <button
              onClick={() => { soundManager.uiClick(); onMainMenu(); }}
              className="btn-ghost flex-1 py-3 rounded-full font-medium text-xs font-mono uppercase tracking-widest flex items-center justify-center transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Menu
            </button>
          </div>
        </div>

        {/* Leaderboard Panel */}
        {showLeaderboard && (
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setLeaderboardTab('local')}
                  className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
                    leaderboardTab === 'local' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Local
                </button>
                <button
                  onClick={() => setLeaderboardTab('global')}
                  className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1 ${
                    leaderboardTab === 'global' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  Global
                </button>
              </div>
              {leaderboardTab === 'global' && globalRank > 0 && (
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Medal className="w-3 h-3 text-amber-400" />
                  #{globalRank}
                </div>
              )}
            </div>

            {leaderboardTab === 'local' ? (
              <div className="space-y-1">
                {leaderboard.getEntries().map((entry, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg ${entry.score === score ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-black/20'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-mono text-sm ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-amber-600' : 'text-zinc-600'}`}>
                        #{idx + 1}
                      </span>
                      <span className="text-white text-sm font-mono">{entry.score.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>W{entry.waves}</span>
                      <span>{leaderboard.getFormattedDate(entry.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : globalLoading ? (
              <div className="flex items-center justify-center py-8 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm font-mono">Loading...</span>
              </div>
            ) : (
              <div className="space-y-1">
                {globalEntries.length > 0 ? (
                  globalEntries.slice(0, 10).map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        entry.rank === globalRank ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-black/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 text-center font-mono text-sm ${
                          entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-zinc-300' : entry.rank === 3 ? 'text-amber-600' : 'text-zinc-600'
                        }`}>
                          #{entry.rank}
                        </span>
                        <span className={`text-sm font-mono ${entry.rank === globalRank ? 'text-cyan-300' : 'text-white'}`}>
                          {entry.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span>{entry.score.toLocaleString()}</span>
                        <span>W{entry.wave}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-sm font-mono">
                    No global scores yet — play to submit yours!
                  </div>
                )}
              </div>
            )}

            {leaderboardTab === 'global' && percentileText && (
              <div className="mt-3 pt-3 border-t border-white/5 text-center">
                <p className="text-xs text-zinc-500">
                  {percentileText} of all players
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
