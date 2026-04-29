import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in local environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function setupDatabase() {
  const tables = [
    {
      name: 'profiles',
      data: { id: '__init__', username: '__init__', email: null, avatar_id: 'default', is_guest: true, level: 1, xp: 0, crystals: 0 },
      conflict: 'id',
    },
    {
      name: 'user_stats',
      data: { profile_id: '__init__', total_playtime: 0, total_kills: 0, total_score: 0, highest_wave: 0, games_played: 0, bugs_smashed: 0, enemies_killed: 0, powerups_collected: 0, upgrades_purchased: 0, achievements_unlocked: [], current_streak: 0, longest_streak: 0 },
      conflict: 'profile_id',
    },
    {
      name: 'user_settings',
      data: { profile_id: '__init__', sound_volume: 0.8, music_volume: 0.6, graphics_quality: 'medium', haptics_enabled: true, show_damage_numbers: true, show_fps: false, difficulty: 'normal' },
      conflict: 'profile_id',
    },
    {
      name: 'game_saves',
      data: { profile_id: '__init__', game_state: {}, version: '1.4.0' },
      conflict: 'profile_id',
    },
    {
      name: 'leaderboard',
      data: { profile_id: '__init__', score: 0, wave: 0 },
      conflict: 'profile_id',
    },
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table.name)
        .upsert(table.data, { onConflict: table.conflict });

      if (error) {
        console.log(`Table ${table.name}: ${error.message}`);
      } else {
        console.log(`Table ${table.name}: OK`);
      }
    } catch (e) {
      console.log(`Table ${table.name}: ${e.message}`);
    }
  }
}

setupDatabase();
