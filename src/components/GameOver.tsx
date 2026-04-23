import { useState, useEffect } from 'react';
import { Skull, RotateCcw, Home, Trophy, Target, Layers } from 'lucide-react';
import { soundManager } from '../game/SoundManager';
import { leaderboard } from '../game/Leaderboard';

interface GameOverProps {
  score: number;
  waves: number;
  kills: number;
  onRetry: () => void;
  onMainMenu: () => void;
}

export function GameOver({ score, waves, kills, onRetry, onMainMenu }: GameOverProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [rank, setRank] = useState(0);

  useEffect(() => {
    const isHigh = leaderboard.isHighScore(score);
    setIsNewHighScore(isHigh);
    setRank(leaderboard.getRank(score));
    
    // Auto-add to leaderboard
    if (score > 0) {
      leaderboard.addEntry(score, waves, kills, 'Player');
    }
  }, [score, waves, kills]);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-50 p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <Skull className="w-7 h-7 text-red-500 opacity-90" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight mb-1">
              {isNewHighScore && rank === 1 ? 'NEW HIGH SCORE!' : 'SYSTEM BREACH'}
            </h2>
            <div className="h-px w-12 bg-red-500/50 mx-auto my-3" />
            <p className="text-zinc-500 text-xs font-mono tracking-widest uppercase">Defense Array Destroyed</p>
          </div>
        </div>
        
        {/* Score Display */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-2xl space-y-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Final Score</p>
          <p className={`text-4xl sm:text-5xl font-mono font-bold tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ${isNewHighScore ? 'text-yellow-400' : 'text-white'}`}>
            {score.toString().padStart(6, '0')}
          </p>
          
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
            className="group relative w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center transition-all overflow-hidden"
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
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 rounded-full font-medium text-xs font-mono uppercase tracking-widest flex items-center justify-center transition-colors"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </button>
            
            <button 
              onClick={() => { soundManager.uiClick(); onMainMenu(); }}
              className="flex-1 py-3 bg-transparent border border-white/10 hover:bg-white/5 text-zinc-400 rounded-full font-medium text-xs font-mono uppercase tracking-widest flex items-center justify-center transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Menu
            </button>
          </div>
        </div>

        {/* Leaderboard Panel */}
        {showLeaderboard && (
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/5">
            <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3">Top Scores</h3>
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
          </div>
        )}
      </div>
    </div>
  );
}