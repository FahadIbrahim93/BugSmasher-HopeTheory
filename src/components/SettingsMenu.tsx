import { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Music, Music2, Trophy, Bug, Clock, Gamepad2 } from 'lucide-react';
import { soundManager } from '../game/SoundManager';
import { saveManager } from '../game/SaveManager';

interface SettingsMenuProps {
  onClose: () => void;
}

export function SettingsMenu({ onClose }: SettingsMenuProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(saveManager.isSoundEnabled());
    setMusicEnabled(saveManager.isMusicEnabled());
  }, []);

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    saveManager.setSoundEnabled(newValue);
    if (newValue) soundManager.uiClick();
  };

  const toggleMusic = () => {
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    saveManager.setMusicEnabled(newValue);
    if (newValue) soundManager.uiClick();
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-6 space-y-6 border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white tracking-tight">SETTINGS</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        {/* Audio Settings */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Audio</h3>
          
          <button
            onClick={toggleSound}
            className="w-full flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 text-zinc-500" />
              )}
              <span className="text-white font-medium">Sound Effects</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-green-500' : 'bg-zinc-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </button>

          <button
            onClick={toggleMusic}
            className="w-full flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {musicEnabled ? (
                <Music2 className="w-5 h-5 text-white" />
              ) : (
                <Music className="w-5 h-5 text-zinc-500" />
              )}
              <span className="text-white font-medium">Music</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${musicEnabled ? 'bg-green-500' : 'bg-zinc-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${musicEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        {/* Stats */}
        {(
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Statistics</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 rounded-xl p-4 space-y-1">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <p className="text-2xl font-black text-white">
                  {saveManager.getHighScore().toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500">HIGH SCORE</p>
              </div>
              
              <div className="bg-zinc-800/50 rounded-xl p-4 space-y-1">
                <Bug className="w-5 h-5 text-green-500" />
                <p className="text-2xl font-black text-white">
                  {saveManager.getTotalBugsSmashed().toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500">BUGS SMASHED</p>
              </div>
              
              <div className="bg-zinc-800/50 rounded-xl p-4 space-y-1">
                <Clock className="w-5 h-5 text-blue-500" />
                <p className="text-2xl font-black text-white">
                  {formatTime(saveManager.getTotalPlayTime())}
                </p>
                <p className="text-xs text-zinc-500">PLAY TIME</p>
              </div>
              
              <div className="bg-zinc-800/50 rounded-xl p-4 space-y-1">
                <Gamepad2 className="w-5 h-5 text-purple-500" />
                <p className="text-2xl font-black text-white">
                  {saveManager.getGamesPlayed()}
                </p>
                <p className="text-xs text-zinc-500">GAMES PLAYED</p>
              </div>
            </div>
          </div>
        )}

        {/* Version */}
        <p className="text-center text-xs text-zinc-600">Version 1.0.0 • BugSmasher AI Studio</p>
      </div>
    </div>
  );
}