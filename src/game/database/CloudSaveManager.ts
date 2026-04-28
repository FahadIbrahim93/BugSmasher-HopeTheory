// CloudSave - Full Supabase Integration
// Hybrid local-first with cloud sync

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CloudSave, GameStateSnapshot } from './types';
import { authManager } from './AuthManager';

const CLOUD_SAVE_KEY = 'bugsmasher_cloud_save';
const AUTO_SAVE_INTERVAL = 30000;

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  
  supabase = createClient(url, key);
  return supabase;
}

export class CloudSaveManager {
  private autoSaveTimer: number | null = null;
  private lastSave: string | null = null;

  getCurrentSave(): CloudSave | null {
    try {
      const data = localStorage.getItem(CLOUD_SAVE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return null;
  }

  saveGame(state: GameStateSnapshot): void {
    const profile = authManager.getProfile();
    if (!profile) return;

    const save: CloudSave = {
      profile_id: profile.id,
      game_state: state,
      timestamp: new Date().toISOString(),
      version: '1.4.0',
    };

    try {
      localStorage.setItem(CLOUD_SAVE_KEY, JSON.stringify(save));
      this.lastSave = save.timestamp;
    } catch (e) {
      console.warn('Failed to save game:', e);
    }

    this.syncToCloud(save);
  }

  async syncToCloud(save: CloudSave): Promise<void> {
    const sb = getSupabase();
    if (!sb) return;

    try {
      await sb.from('game_saves').upsert({
        profile_id: save.profile_id,
        game_state: save.game_state,
        version: save.version,
        timestamp: save.timestamp,
      }, { onConflict: 'profile_id' });
    } catch (e) {
      console.warn('Cloud save sync failed:', e);
    }
  }

  async loadFromCloud(): Promise<CloudSave | null> {
    const sb = getSupabase();
    const profile = authManager.getProfile();
    if (!sb || !profile) return null;

    try {
      const { data, error } = await sb
        .from('game_saves')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (error || !data) return null;

      return data as CloudSave;
    } catch (e) {
      console.warn('Cloud load failed:', e);
      return null;
    }
  }

  loadGame(): GameStateSnapshot | null {
    const save = this.getCurrentSave();
    return save?.game_state || null;
  }

  async restoreGame(): Promise<GameStateSnapshot | null> {
    const cloudSave = await this.loadFromCloud();
    if (cloudSave) {
      localStorage.setItem(CLOUD_SAVE_KEY, JSON.stringify(cloudSave));
      return cloudSave.game_state;
    }
    return this.loadGame();
  }

  hasSave(): boolean {
    return !!this.getCurrentSave();
  }

  getLastSaveTime(): string | null {
    return this.lastSave;
  }

  deleteSave(): void {
    localStorage.removeItem(CLOUD_SAVE_KEY);
    this.lastSave = null;
  }

  startAutoSave(getState: () => GameStateSnapshot): void {
    if (this.autoSaveTimer) return;

    this.autoSaveTimer = window.setInterval(() => {
      if (authManager.isAuthenticated()) {
        this.saveGame(getState());
      }
    }, AUTO_SAVE_INTERVAL);
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}

export const cloudSaveManager = new CloudSaveManager();