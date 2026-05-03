import { useState, useEffect } from 'react';
import { soundManager } from '../game/SoundManager';
import { SettingsMenu } from './SettingsMenu';
import { MatrixRain } from './MatrixRain';
import { CustomBugLogo } from './CustomBugLogo';
import { authManager } from '../game/database/AuthManager';
import { AccountScreen } from './AccountScreen';
import { cloudSaveManager } from '../game/database/CloudSaveManager';
import { PrestigeDisplay, DailyChallengeBadge } from './PrestigeDisplay';
import { UpgradeMenu } from './UpgradeMenu';
import type { Profile, GameStateSnapshot } from '../game/database/types';

export function MainMenu({ onStart }: { onStart: (resumeState?: GameStateSnapshot) => void }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedGame, setSavedGame] = useState<{ wave: number; score: number; timestamp: string } | null>(null);

  useEffect(() => {
    const updateProfile = () => setProfile(authManager.getProfile());
    updateProfile();
    const unsub = authManager.subscribe(updateProfile);
    return unsub;
  }, []);

  // Check for existing save on mount
  useEffect(() => {
    const save = cloudSaveManager.getCurrentSave();
    if (save) {
      const saveAge = Date.now() - new Date(save.timestamp).getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      if (saveAge < oneDay) {
        setSavedGame({
          wave: save.game_state.wave,
          score: save.game_state.score,
          timestamp: save.timestamp,
        });
      }
    }
  }, []);

  const handleStart = (resumeState?: GameStateSnapshot) => {
    soundManager.init();
    soundManager.uiClick();
    onStart(resumeState);
  };

  const handleContinue = () => {
    soundManager.init();
    soundManager.uiClick();
    const save = cloudSaveManager.loadGame();
    if (save) {
      onStart(save);
    } else {
      onStart();
    }
  };

  const handleSignIn = () => {
    soundManager.init();
    soundManager.uiClick();
    setShowAccount(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#050505] relative p-4">
      <MatrixRain />
      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
      {showAccount && <AccountScreen onClose={() => setShowAccount(false)} />}
      {showUpgrades && <UpgradeMenu onClose={() => setShowUpgrades(false)} />}
      <div className="z-10 flex flex-col items-center space-y-12 sm:space-y-16 w-full max-w-lg">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center mb-6 mt-8 sm:mt-12">
             <CustomBugLogo className="w-16 h-16 sm:w-24 sm:h-24" />
           </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white font-display">
            BUGSMASHER
          </h1>
          <div className="h-px w-24 bg-white/20 mx-auto mt-4 mb-6" />
          <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-medium tracking-[0.2em] font-mono">
            DEFEND THE CORE. SMASH THE SWARM.
          </p>
        </div>
        
        <div className="w-full flex flex-col items-center space-y-4 mt-4">
          {profile ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-lg font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-white font-bold">{profile.username}</p>
                  <p className="text-zinc-500 text-sm">Level {profile.level} • {profile.crystals} crystals</p>
                </div>
              </div>

              {/* Prestige + Daily Challenge badges */}
              <div className="flex flex-col items-center gap-3 mb-2">
                <PrestigeDisplay />
                <DailyChallengeBadge />
              </div>

              {/* Upgrades CTA */}
              <button
                onClick={() => { soundManager.uiClick(); setShowUpgrades(true); }}
                className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 hover:text-cyan-300 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
              >
                ⚡ Upgrades
              </button>

              {/* Continue / New Game buttons */}
              {savedGame ? (
                <div className="w-full flex flex-col space-y-3">
                  <button 
                    onClick={handleContinue}
                    onMouseEnter={() => { soundManager.init(); soundManager.uiHover(); }}
                    className="group relative px-12 py-4 bg-cyan-500 text-black hover:bg-cyan-400 rounded-full font-bold text-sm sm:text-base uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                  >
                    Continue — Wave {savedGame.wave}, {savedGame.score.toLocaleString()} pts
                  </button>
                  <button 
                    onClick={() => handleStart()}
                    onMouseEnter={() => { soundManager.init(); soundManager.uiHover(); }}
                    className="group relative px-12 py-3 border border-white/20 text-zinc-400 hover:text-white hover:border-white/40 rounded-full font-medium text-sm uppercase tracking-widest transition-all"
                  >
                    New Game
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleStart()}
                  onMouseEnter={() => { soundManager.init(); soundManager.uiHover(); }}
                  className="group relative px-12 py-4 bg-white text-black hover:bg-zinc-200 rounded-full font-bold text-sm sm:text-base uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                >
                  Start Game
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex flex-col space-y-4">
              <button 
                onClick={() => handleStart()}
                onMouseEnter={() => { soundManager.init(); soundManager.uiHover(); }}
                className="group relative px-10 py-4 bg-white text-black hover:bg-zinc-200 rounded-full font-bold text-sm sm:text-base uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                Play as Guest
              </button>
              
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-zinc-600 text-xs uppercase">or</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleSignIn}
                  className="flex-1 py-3 px-4 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-full font-medium text-sm transition-all"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleSignIn}
                  className="flex-1 py-3 px-4 bg-cyan-500 text-black hover:bg-cyan-400 rounded-full font-bold text-sm transition-all"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => { soundManager.uiClick(); setShowSettings(true); }}
          className="text-zinc-500 hover:text-white text-sm transition-colors"
        >
          Settings
        </button>
        
        <button
          onClick={() => { soundManager.uiClick(); setShowAccount(true); }}
          className="absolute top-4 right-4 flex items-center gap-2 text-sm transition-colors"
        >
          {profile ? (
            <>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-zinc-400 hover:text-white">{profile.username}</span>
            </>
          ) : (
            <span className="text-zinc-500 hover:text-white">Account</span>
          )}
        </button>
      </div>
    </div>
  );
}
