import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cloudSaveManager } from './CloudSaveManager';
import type { CloudSave, GameStateSnapshot } from './types';

vi.mock('./AuthManager', () => ({
  authManager: {
    getProfile: vi.fn(),
    isAuthenticated: vi.fn(() => true),
  },
}));

vi.mock('./supabaseConfig', () => ({
  getSupabaseUrl: vi.fn(() => null),
  getSupabaseAnonKey: vi.fn(() => null),
}));

describe('CloudSaveManager', () => {
  const mockGameState: GameStateSnapshot = {
    score: 1000,
    wave: 5,
    health: 100,
    upgrades: { health: 1, radius: 1, turret: 0 },
    unlocked_biomes: [],
    equipped_cosmetics: { core: 'core_default', bug: '', trail: '', ui: '' },
    prestige_level: 0,
    achievement_unlocks: [],
    daily_challenge_date: '',
    daily_challenge_completed: false,
  };

  const mockCloudSave: CloudSave = {
    profile_id: 'test-profile',
    game_state: mockGameState,
    timestamp: '2026-04-29T12:00:00.000Z',
    version: '1.4.0',
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getCurrentSave', () => {
    it('returns null when no save exists', () => {
      expect(cloudSaveManager.getCurrentSave()).toBeNull();
    });

    it('returns parsed save when exists', () => {
      localStorage.setItem('bugsmasher_cloud_save', JSON.stringify(mockCloudSave));
      const result = cloudSaveManager.getCurrentSave();
      expect(result).toEqual(mockCloudSave);
    });

    it('returns null on invalid JSON', () => {
      localStorage.setItem('bugsmasher_cloud_save', 'invalid');
      expect(cloudSaveManager.getCurrentSave()).toBeNull();
    });
  });

  describe('saveGame', () => {
    it('does not save when no profile', async () => {
      const { authManager } = await import('./AuthManager');
      vi.mocked(authManager.getProfile).mockReturnValueOnce(null);
      
      cloudSaveManager.saveGame(mockGameState);
      
      expect(localStorage.getItem('bugsmasher_cloud_save')).toBeNull();
    });

    it('saves to localStorage when profile exists', async () => {
      const { authManager } = await import('./AuthManager');
      vi.mocked(authManager.getProfile).mockReturnValueOnce({ id: 'test-profile', username: 'Test', avatar_id: 'default', level: 1, xp: 0, crystals: 0, email: null, avatar_url: null, is_guest: true, created_at: '', updated_at: '' });
      
      cloudSaveManager.saveGame(mockGameState);
      
      const saved = localStorage.getItem('bugsmasher_cloud_save');
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.profile_id).toBe('test-profile');
      expect(parsed.game_state).toEqual(mockGameState);
    });
  });

  describe('loadGame', () => {
    it('returns null when no save', () => {
      expect(cloudSaveManager.loadGame()).toBeNull();
    });

    it('returns game_state when save exists', () => {
      localStorage.setItem('bugsmasher_cloud_save', JSON.stringify(mockCloudSave));
      const result = cloudSaveManager.loadGame();
      expect(result).toEqual(mockGameState);
    });
  });

  describe('hasSave', () => {
    it('returns false when no save', () => {
      expect(cloudSaveManager.hasSave()).toBe(false);
    });

    it('returns true when save exists', () => {
      localStorage.setItem('bugsmasher_cloud_save', JSON.stringify(mockCloudSave));
      expect(cloudSaveManager.hasSave()).toBe(true);
    });
  });

  describe('deleteSave', () => {
    it('removes save from localStorage', () => {
      localStorage.setItem('bugsmasher_cloud_save', JSON.stringify(mockCloudSave));
      cloudSaveManager.deleteSave();
      expect(localStorage.getItem('bugsmasher_cloud_save')).toBeNull();
    });
  });

  describe('getLastSaveTime', () => {
    it('returns null initially', () => {
      expect(cloudSaveManager.getLastSaveTime()).toBeNull();
    });

    it('returns timestamp after save', async () => {
      const { authManager } = await import('./AuthManager');
      vi.mocked(authManager.getProfile).mockReturnValueOnce({ id: 'test-profile', username: 'Test', avatar_id: 'default', level: 1, xp: 0, crystals: 0, email: null, avatar_url: null, is_guest: true, created_at: '', updated_at: '' });
      
      cloudSaveManager.saveGame(mockGameState);
      const lastSave = cloudSaveManager.getLastSaveTime();
      expect(lastSave).toBeTruthy();
    });
  });

  describe('syncToCloud', () => {
    it('handles missing supabase gracefully', async () => {
      await expect(cloudSaveManager.syncToCloud(mockCloudSave)).resolves.toBeUndefined();
    });
  });

  describe('loadFromCloud', () => {
    it('returns null without profile', async () => {
      const { authManager } = await import('./AuthManager');
      vi.mocked(authManager.getProfile).mockReturnValueOnce(null);
      
      const result = await cloudSaveManager.loadFromCloud();
      expect(result).toBeNull();
    });
  });

  describe('restoreGame', () => {
    it('falls back to local when cloud fails', async () => {
      localStorage.setItem('bugsmasher_cloud_save', JSON.stringify(mockCloudSave));
      const result = await cloudSaveManager.restoreGame();
      expect(result).toEqual(mockGameState);
    });
  });
});