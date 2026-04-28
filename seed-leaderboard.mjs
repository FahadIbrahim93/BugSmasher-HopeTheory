import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://faloknbaathdkmaeodxt.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhbG9rbmJhYXRoZGttYWVvZHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIyNzU0NywiZXhwIjoyMDkyODAzNTQ3fQ.i3hGk8Pib_o1ISX4RHhKXqq90grwci8Wa6GnUGbKajA';

const supabase = createClient(supabaseUrl, serviceKey);

const players = [
  { id: 'cpu_1', username: 'NeonSlayer', avatar_id: 'legend', level: 25, xp: 5000, crystals: 500, is_guest: false, score: 125000, wave: 45 },
  { id: 'cpu_2', username: 'CyberHunter', avatar_id: 'assassin', level: 22, xp: 4200, crystals: 350, is_guest: false, score: 98500, wave: 38 },
  { id: 'cpu_3', username: 'QuantumBug', avatar_id: 'scout', level: 20, xp: 3800, crystals: 280, is_guest: false, score: 87200, wave: 35 },
  { id: 'cpu_4', username: 'VoidWalker', avatar_id: 'tank', level: 18, xp: 3200, crystals: 220, is_guest: false, score: 75800, wave: 32 },
  { id: 'cpu_5', username: 'DataBreaker', avatar_id: 'warrior', level: 15, xp: 2600, crystals: 180, is_guest: false, score: 65400, wave: 28 },
  { id: 'cpu_6', username: 'BugExterminator', avatar_id: 'default', level: 12, xp: 2000, crystals: 150, is_guest: false, score: 58200, wave: 25 },
  { id: 'cpu_7', username: 'SwarmDestroyer', avatar_id: 'scout', level: 10, xp: 1600, crystals: 120, is_guest: false, score: 52100, wave: 22 },
  { id: 'cpu_8', username: 'CoreGuardian', avatar_id: 'tank', level: 8, xp: 1200, crystals: 90, is_guest: false, score: 45600, wave: 20 },
  { id: 'cpu_9', username: 'DigitalNinja', avatar_id: 'assassin', level: 6, xp: 900, crystals: 70, is_guest: false, score: 38900, wave: 18 },
  { id: 'cpu_10', username: 'PixelHunter', avatar_id: 'warrior', level: 5, xp: 600, crystals: 50, is_guest: false, score: 32500, wave: 15 },
];

async function seedLeaderboard() {
  console.log('🏆 Seeding leaderboard with CPU players...\n');
  
  for (const p of players) {
    // Add profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: p.id,
      username: p.username,
      email: null,
      avatar_id: p.avatar_id,
      is_guest: p.is_guest,
      level: p.level,
      xp: p.xp,
      crystals: p.crystals,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    
    if (profileError) {
      console.log(`Profile error for ${p.username}:`, profileError.message);
      continue;
    }
    
    // Add stats
    const { error: statsError } = await supabase.from('user_stats').upsert({
      profile_id: p.id,
      total_playtime: Math.floor(p.score / 100),
      total_kills: Math.floor(p.score / 50),
      total_score: p.score,
      highest_wave: p.wave,
      games_played: Math.floor(p.score / 5000),
      bugs_smashed: Math.floor(p.score / 50),
      enemies_killed: Math.floor(p.score / 60),
      powerups_collected: Math.floor(p.score / 2000),
      current_streak: Math.floor(Math.random() * 7) + 1,
      longest_streak: Math.floor(Math.random() * 14) + 3,
    }, { onConflict: 'profile_id' });
    
    if (statsError) console.log(`Stats error for ${p.username}:`, statsError.message);
    
    // Add leaderboard entry
    const { error: lbError } = await supabase.from('leaderboard').upsert({
      profile_id: p.id,
      score: p.score,
      wave: p.wave,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_id' });
    
    if (lbError) console.log(`Leaderboard error for ${p.username}:`, lbError.message);
    
    console.log(`✅ ${p.username} - Score: ${p.score.toLocaleString()}, Wave: ${p.wave}`);
  }
  
  console.log('\n✅ Leaderboard seeded with 10 CPU players!\n');
}

seedLeaderboard().then(() => process.exit(0));