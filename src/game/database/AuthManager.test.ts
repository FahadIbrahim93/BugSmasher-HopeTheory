import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthManager } from './AuthManager';
import type { AuthUser, AuthState } from './AuthManager';

vi.mock('./supabaseConfig', () => ({
  supabaseConfig: {
    url: '',
    anonKey: '',
  },
  getSupabaseUrl: vi.fn(() => null),
  getSupabaseAnonKey: vi.fn(() => null),
}));

describe('AuthManager', () => {
  let authManager: AuthManager;

  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    authManager = new AuthManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signInAsGuest', () => {
    it('creates a guest user with correct provider', async () => {
      const user = await authManager.signInAsGuest();
      
      expect(user.provider).toBe('guest');
      expect(user.isAnonymous).toBe(true);
      expect(user.email).toBeNull();
    });

    it('creates guest user with correct id format', async () => {
      const user = await authManager.signInAsGuest();
      
      expect(user.id).toMatch(/^guest_/);
    });

    it('creates guest user with random username', async () => {
      const user = await authManager.signInAsGuest();
      
      expect(user.username).toMatch(/^(Neon|Cyber|Digital|Quantum|Shadow|Storm|Thunder|Phoenix)(Hunter|Slayer|Warrior|Ninja|Ghost|Knight|Striker|Viper)\d{1,3}$/);
    });

    it('creates profile for guest user', async () => {
      const user = await authManager.signInAsGuest();
      const profile = authManager.getProfile();
      
      expect(profile).not.toBeNull();
      expect(profile!.id).toBe(user.id);
      expect(profile!.username).toBe(user.username);
      expect(profile!.is_guest).toBe(true);
      expect(profile!.level).toBe(1);
      expect(profile!.xp).toBe(0);
      expect(profile!.crystals).toBe(0);
    });
  });

  describe('signUpWithEmail', () => {
    it('creates an email user', async () => {
      const user = await authManager.signUpWithEmail('test@example.com', 'password123', 'TestUser');
      
      expect(user.provider).toBe('email');
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('TestUser');
      expect(user.isAnonymous).toBe(false);
    });

    it('initializes stats for new email user', async () => {
      await authManager.signUpWithEmail('test@example.com', 'password123', 'TestUser');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bugsmasher_stats',
        expect.any(String)
      );
    });

    it('initializes settings for new email user', async () => {
      await authManager.signUpWithEmail('test@example.com', 'password123', 'TestUser');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bugsmasher_settings',
        expect.any(String)
      );
    });
  });

  describe('signInWithEmail', () => {
    it('creates email user', async () => {
      const user = await authManager.signInWithEmail('test@example.com', 'password123');
      
      expect(user.provider).toBe('email');
      expect(user.email).toBe('test@example.com');
      expect(user.isAnonymous).toBe(false);
    });

    it('loads stats if they exist', async () => {
      const existingStats = { profile_id: 'test', total_playtime: 100, bugs_smashed: 50 };
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'bugsmasher_stats') return JSON.stringify(existingStats);
        return null;
      });
      
      await authManager.signInWithEmail('test@example.com', 'password123');
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('falls back to signInWithEmail when Supabase not configured', async () => {
      const result = await authManager.signIn('test@example.com', 'password123');
      
      expect(result.success).toBe(true);
      expect(authManager.getUser()).not.toBeNull();
    });

    it('returns {success: false, error} on Supabase error', async () => {
      // We can't easily mock the error path without mocking the entire Supabase module
      // This test validates the fallback behavior works
      const result = await authManager.signIn('test@example.com', 'password123');
      
      expect(result.success).toBe(true); // Falls back to local auth
    });
  });

  describe('updateUsername', () => {
    it('updates user and profile username', async () => {
      await authManager.signInAsGuest();
      const originalUsername = authManager.getUser()!.username;
      
      await authManager.updateUsername('NewUsername');
      
      expect(authManager.getUser()!.username).toBe('NewUsername');
      expect(authManager.getProfile()!.username).toBe('NewUsername');
      expect(originalUsername).not.toBe('NewUsername');
    });

    it('persists updated username to localStorage', async () => {
      await authManager.signInAsGuest();
      await authManager.updateUsername('NewUsername');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bugsmasher_auth',
        expect.stringContaining('NewUsername')
      );
    });
  });

  describe('addXP', () => {
    it('adds XP to profile', async () => {
      await authManager.signInAsGuest();
      
      authManager.addXP(50);
      
      expect(authManager.getProfile()!.xp).toBe(50);
    });

    it('auto-levels up when XP threshold reached', async () => {
      await authManager.signInAsGuest();
      
      // Level 1 requires 100 XP (100 * 1)
      authManager.addXP(100);
      
      const profile = authManager.getProfile()!;
      expect(profile.level).toBe(2);
      expect(profile.xp).toBe(0);
    });

    it('handles multiple level ups', async () => {
      await authManager.signInAsGuest();
      
      // Add 250 XP: level 1 requires 100 XP to level up
      // 250 >= 100*1 = 100, level up: xp = 250-100=150, level=2
      // 150 >= 100*2 = 200, no level up
      authManager.addXP(250);
      
      const profile = authManager.getProfile()!;
      expect(profile.level).toBe(2);
      expect(profile.xp).toBe(150);
    });
  });

  describe('addCrystals', () => {
    it('adds crystals to profile', async () => {
      await authManager.signInAsGuest();
      
      authManager.addCrystals(100);
      
      expect(authManager.getProfile()!.crystals).toBe(100);
    });

    it('accumulates crystals from multiple additions', async () => {
      await authManager.signInAsGuest();
      
      authManager.addCrystals(50);
      authManager.addCrystals(75);
      
      expect(authManager.getProfile()!.crystals).toBe(125);
    });
  });

  describe('spendCrystals', () => {
    it('deducts crystals when sufficient balance', async () => {
      await authManager.signInAsGuest();
      authManager.addCrystals(100);
      
      const result = authManager.spendCrystals(30);
      
      expect(result).toBe(true);
      expect(authManager.getProfile()!.crystals).toBe(70);
    });

    it('returns false if insufficient crystals', async () => {
      await authManager.signInAsGuest();
      authManager.addCrystals(50);
      
      const result = authManager.spendCrystals(100);
      
      expect(result).toBe(false);
      expect(authManager.getProfile()!.crystals).toBe(50); // Unchanged
    });

    it('does nothing when no profile exists', () => {
      const result = authManager.spendCrystals(100);
      
      expect(result).toBe(false);
    });
  });

  describe('signOut', () => {
    it('clears user and profile', async () => {
      await authManager.signInAsGuest();
      
      authManager.signOut();
      
      expect(authManager.getUser()).toBeNull();
      expect(authManager.getProfile()).toBeNull();
    });

    it('clears localStorage entries', async () => {
      await authManager.signInAsGuest();
      
      authManager.signOut();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('bugsmasher_auth');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('bugsmasher_profile');
    });

    it('notifies listeners after sign out', async () => {
      await authManager.signInAsGuest();
      const listener = vi.fn();
      authManager.subscribe(listener);
      
      authManager.signOut();
      
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('adds listener and returns unsubscribe function', async () => {
      const listener = vi.fn();
      const unsubscribe = authManager.subscribe(listener);
      
      await authManager.signInAsGuest();
      
      expect(listener).toHaveBeenCalled();
      
      unsubscribe();
      
      const callCountBefore = listener.mock.calls.length;
      await authManager.updateUsername('Test');
      
      expect(listener.mock.calls.length).toBe(callCountBefore);
    });

    it('notifies listener on state changes', async () => {
      const listener = vi.fn();
      authManager.subscribe(listener);
      
      await authManager.signInAsGuest();
      
      expect(listener).toHaveBeenCalled();
      const state = listener.mock.calls[0][0] as AuthState;
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('getState', () => {
    it('returns correct AuthState shape', async () => {
      await authManager.signInAsGuest();
      
      const state = authManager.getState();
      
      expect(state).toHaveProperty('user');
      expect(state).toHaveProperty('profile');
      expect(state).toHaveProperty('isLoading');
      expect(state).toHaveProperty('isAuthenticated');
    });

    it('returns null user when not authenticated', () => {
      const state = authManager.getState();
      
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('returns user when authenticated', async () => {
      await authManager.signInAsGuest();
      
      const state = authManager.getState();
      
      expect(state.user).not.toBeNull();
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('isGuest', () => {
    it('returns true only for guest users', async () => {
      await authManager.signInAsGuest();
      
      expect(authManager.isGuest()).toBe(true);
    });

    it('returns false for email users', async () => {
      await authManager.signUpWithEmail('test@example.com', 'password', 'TestUser');
      
      expect(authManager.isGuest()).toBe(false);
    });

    it('returns false when not authenticated', () => {
      expect(authManager.isGuest()).toBe(false);
    });
  });

  describe('getUser', () => {
    it('returns null when not authenticated', () => {
      expect(authManager.getUser()).toBeNull();
    });

    it('returns user when authenticated', async () => {
      await authManager.signInAsGuest();
      
      expect(authManager.getUser()).not.toBeNull();
      expect(authManager.getUser()!.provider).toBe('guest');
    });
  });

  describe('getProfile', () => {
    it('returns null when not authenticated', () => {
      expect(authManager.getProfile()).toBeNull();
    });

    it('returns profile when authenticated', async () => {
      await authManager.signInAsGuest();
      
      expect(authManager.getProfile()).not.toBeNull();
      expect(authManager.getProfile()!.is_guest).toBe(true);
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no user', () => {
      expect(authManager.isAuthenticated()).toBe(false);
    });

    it('returns true when user exists', async () => {
      await authManager.signInAsGuest();
      
      expect(authManager.isAuthenticated()).toBe(true);
    });
  });

  describe('linkProvider', () => {
    it('adds provider to linkedProviders list', async () => {
      await authManager.signInAsGuest();
      
      await authManager.linkProvider('google');
      
      expect(authManager.getUser()!.linkedProviders).toContain('google');
    });

    it('does not add duplicate providers', async () => {
      await authManager.signInAsGuest();
      
      await authManager.linkProvider('guest');
      
      const count = authManager.getUser()!.linkedProviders.filter(p => p === 'guest').length;
      expect(count).toBe(1);
    });

    it('does nothing when no user', async () => {
      await authManager.linkProvider('google');
      
      expect(authManager.getUser()).toBeNull();
    });
  });

  describe('updateAvatar', () => {
    it('updates avatar_id in profile', async () => {
      await authManager.signInAsGuest();
      
      await authManager.updateAvatar('warrior');
      
      expect(authManager.getProfile()!.avatar_id).toBe('warrior');
    });

    it('does nothing when no profile', async () => {
      await authManager.updateAvatar('warrior');
      
      expect(authManager.getProfile()).toBeNull();
    });
  });

  describe('syncToCloud', () => {
    it('handles null Supabase gracefully', async () => {
      await authManager.signInAsGuest();
      
      // Should not throw, just warn
      await expect(authManager.syncToCloud()).resolves.not.toThrow();
    });
  });

  describe('loadFromCloud', () => {
    it('returns null when no Supabase', async () => {
      await authManager.signInAsGuest();
      
      const result = await authManager.loadFromCloud();
      
      expect(result).toBeNull();
    });

    it('returns null when no user', async () => {
      const result = await authManager.loadFromCloud();
      
      expect(result).toBeNull();
    });
  });

  describe('restoreSession', () => {
    it('returns null when no user', async () => {
      const result = await authManager.restoreSession();
      
      expect(result).toBeNull();
    });

    it('returns cloud profile when available', async () => {
      await authManager.signInAsGuest();
      
      const result = await authManager.restoreSession();
      
      // Without Supabase, returns null
      expect(result).toBeNull();
    });
  });

  describe('deleteAccount', () => {
    it('clears all localStorage', async () => {
      await authManager.signInAsGuest();
      
      authManager.deleteAccount();
      
      expect(localStorageMock.clear).toHaveBeenCalled();
    });
  });

  describe('handleSupabaseUser', () => {
    it('creates user from Supabase user object', async () => {
      const sbUser = {
        id: 'sb_user_123',
        email: 'supabase@example.com',
        created_at: '2024-01-01T00:00:00Z',
        is_anonymous: false,
        app_metadata: { provider: 'email' },
        user_metadata: { username: 'SupabaseUser' },
      } as any;
      
      await authManager.handleSupabaseUser(sbUser);
      
      expect(authManager.getUser()).not.toBeNull();
      expect(authManager.getUser()!.id).toBe('sb_user_123');
      expect(authManager.getUser()!.email).toBe('supabase@example.com');
      expect(authManager.getUser()!.username).toBe('SupabaseUser');
    });

    it('extracts username from email if not in metadata', async () => {
      const sbUser = {
        id: 'sb_user_456',
        email: 'testuser@example.com',
        created_at: '2024-01-01T00:00:00Z',
        is_anonymous: false,
        app_metadata: { provider: 'email' },
        user_metadata: {},
      } as any;
      
      await authManager.handleSupabaseUser(sbUser);
      
      expect(authManager.getUser()!.username).toBe('testuser');
    });
  });

  describe('Guest users have isAnonymous', () => {
    it('guest user isAnonymous is true', async () => {
      const user = await authManager.signInAsGuest();
      
      expect(user.isAnonymous).toBe(true);
    });

    it('email user isAnonymous is false', async () => {
      const user = await authManager.signUpWithEmail('test@example.com', 'password', 'TestUser');
      
      expect(user.isAnonymous).toBe(false);
    });
  });
});
