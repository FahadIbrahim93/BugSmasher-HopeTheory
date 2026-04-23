// SaveManager - Handles persistent game data using localStorage
// High scores, settings, and statistics

interface GameSaveData {
  highScore: number;
  totalBugsSmashed: number;
  totalPlayTime: number; // seconds
  soundEnabled: boolean;
  musicEnabled: boolean;
  lastPlayed: string; // ISO timestamp
  gamesPlayed: number;
}

const SAVE_KEY = 'bugsmasher_save';
const DEFAULT_SAVE: GameSaveData = {
  highScore: 0,
  totalBugsSmashed: 0,
  totalPlayTime: 0,
  soundEnabled: true,
  musicEnabled: true,
  lastPlayed: '',
  gamesPlayed: 0
};

export class SaveManager {
  private data: GameSaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): GameSaveData {
    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (stored) {
        return { ...DEFAULT_SAVE, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return { ...DEFAULT_SAVE };
  }

  private save(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  }

  // Getters
  getHighScore(): number { return this.data.highScore; }
  getTotalBugsSmashed(): number { return this.data.totalBugsSmashed; }
  getTotalPlayTime(): number { return this.data.totalPlayTime; }
  isSoundEnabled(): boolean { return this.data.soundEnabled; }
  isMusicEnabled(): boolean { return this.data.musicEnabled; }
  getGamesPlayed(): number { return this.data.gamesPlayed; }

  // Update methods
  updateHighScore(score: number): boolean {
    if (score > this.data.highScore) {
      this.data.highScore = score;
      this.save();
      return true;
    }
    return false;
  }

  addBugsSmashed(count: number): void {
    this.data.totalBugsSmashed += count;
    this.save();
  }

  addPlayTime(seconds: number): void {
    this.data.totalPlayTime += seconds;
    this.save();
  }

  setSoundEnabled(enabled: boolean): void {
    this.data.soundEnabled = enabled;
    this.save();
  }

  setMusicEnabled(enabled: boolean): void {
    this.data.musicEnabled = enabled;
    this.save();
  }

  recordGamePlayed(): void {
    this.data.gamesPlayed++;
    this.data.lastPlayed = new Date().toISOString();
    this.save();
  }

  // Get formatted stats
  getFormattedStats(): string {
    const hours = Math.floor(this.data.totalPlayTime / 3600);
    const mins = Math.floor((this.data.totalPlayTime % 3600) / 60);
    return `High Score: ${this.data.highScore.toLocaleString()} | Bugs: ${this.data.totalBugsSmashed.toLocaleString()} | Time: ${hours}h ${mins}m | Games: ${this.data.gamesPlayed}`;
  }

  // Reset all data
  resetData(): void {
    this.data = { ...DEFAULT_SAVE };
    this.save();
  }
}

// Singleton instance for easy import
export const saveManager = new SaveManager();