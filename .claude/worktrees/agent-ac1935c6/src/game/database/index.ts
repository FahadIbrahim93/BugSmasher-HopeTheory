// Database module exports
export * from './types';
export * from './AuthManager';
export * from './CloudSaveManager';
export * from './StatsManager';
export * from './LeaderboardManager';

import { authManager } from './AuthManager';
import { cloudSaveManager } from './CloudSaveManager';
import { statsManager } from './StatsManager';
import { leaderboardManager } from './LeaderboardManager';

export function initializeDatabase(): void {
  localStorage.removeItem('bugsmasher_auth');
  
  statsManager.initialize();
}

export async function restoreUserData(): Promise<void> {
  await authManager.restoreSession();
  
  const state = authManager.getState();
  if (state.isAuthenticated) {
    await statsManager.restore();
    await cloudSaveManager.restoreGame();
  }
}

export async function saveAllData(): Promise<void> {
  await authManager.syncToCloud();
  await statsManager.syncToCloud();
}

export const db = {
  auth: authManager,
  cloudSave: cloudSaveManager,
  stats: statsManager,
  leaderboard: leaderboardManager,
};