import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeaderboardManager, leaderboardManager } from './LeaderboardManager';

vi.mock('./AuthManager', () => ({
  authManager: {
    getProfile: vi.fn(),
  },
}));

vi.mock('./supabaseConfig', () => ({
  getSupabaseUrl: vi.fn(() => null),
  getSupabaseAnonKey: vi.fn(() => null),
}));

describe('LeaderboardManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('initializes with empty data', () => {
      const manager = new LeaderboardManager();
      expect((manager as any).data.entries).toEqual([]);
    });
  });

  describe('getGlobalLeaderboardSync', () => {
    it('returns mock players when no cache', () => {
      const result = leaderboardManager.getGlobalLeaderboardSync(5);
      expect(result.length).toBe(5);
      expect(result[0].username).toBe('NeonSlayer');
    });

    it('respects limit', () => {
      const result = leaderboardManager.getGlobalLeaderboardSync(3);
      expect(result.length).toBe(3);
    });
  });

  describe('getTopScore', () => {
    it('returns highest score from mock data', () => {
      expect(leaderboardManager.getTopScore()).toBe(125000);
    });
  });

  describe('getPercentile', () => {
    it('returns string for valid ranks', () => {
      const result = leaderboardManager.getPercentile(1);
      expect(typeof result).toBe('string');
      expect(result).toContain('Top');
    });

    it('handles various rank values', () => {
      expect(leaderboardManager.getPercentile(1)).toBeTruthy();
      expect(leaderboardManager.getPercentile(5)).toBeTruthy();
      expect(leaderboardManager.getPercentile(10)).toBeTruthy();
    });
  });

  describe('syncToCloud', () => {
    it('handles missing supabase gracefully', async () => {
      await expect(leaderboardManager.syncToCloud(1000, 5)).resolves.toBeUndefined();
    });
  });

  describe('loadFromCloud', () => {
    it('falls back to local when no supabase', async () => {
      const result = await leaderboardManager.loadFromCloud();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].username).toBe('NeonSlayer');
    });
  });

  describe('submitScore', () => {
    it('returns 0 when no profile', async () => {
      const { authManager } = await import('./AuthManager');
      vi.mocked(authManager.getProfile).mockReturnValueOnce(null);
      
      const rank = await leaderboardManager.submitScore(1000, 5);
      expect(rank).toBe(0);
    });
  });

  describe('getMyRank', () => {
    it('returns 0 when no profile', async () => {
      const { authManager } = await import('./AuthManager');
      vi.mocked(authManager.getProfile).mockReturnValueOnce(null);
      
      const rank = await leaderboardManager.getMyRank();
      expect(rank).toBe(0);
    });
  });

  describe('getFriends', () => {
    it('returns empty array without profile', async () => {
      const { authManager } = await import('./AuthManager');
      vi.mocked(authManager.getProfile).mockReturnValueOnce(null);
      
      const friends = await leaderboardManager.getFriends();
      expect(friends).toEqual([]);
    });
  });

  describe('addFriend', () => {
    it('handles missing profile', async () => {
      const { authManager } = await import('./AuthManager');
      vi.mocked(authManager.getProfile).mockReturnValueOnce(null);
      
      await expect(leaderboardManager.addFriend('friend-123')).resolves.toBeUndefined();
    });
  });

  describe('removeFriend', () => {
    it('handles missing profile', async () => {
      const { authManager } = await import('./AuthManager');
      vi.mocked(authManager.getProfile).mockReturnValueOnce(null);
      
      await expect(leaderboardManager.removeFriend('friend-123')).resolves.toBeUndefined();
    });
  });
});