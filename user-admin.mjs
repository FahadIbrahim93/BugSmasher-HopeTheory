import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://faloknbaathdkmaeodxt.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhbG9rbmJhYXRoZGttYWVvZHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIyNzU0NywiZXhwIjoyMDkyODAzNTQ3fQ.i3hGk8Pib_o1ISX4RHhKXqq90grwci8Wa6GnUGbKajA';

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const cmd = process.argv[2];
  
  switch (cmd) {
    case 'list':
      await listUsers();
      break;
    case 'add':
      await addTestUser();
      break;
    case 'stats':
      await listStats();
      break;
    case 'leaderboard':
      await showLeaderboard();
      break;
    case 'all':
      await listUsers();
      await showLeaderboard();
      break;
    default:
      console.log('Usage: node user-admin.mjs <command>');
      console.log('Commands:');
      console.log('  list       - List all users');
      console.log('  add        - Add test user');
      console.log('  stats      - List user stats');
      console.log('  leaderboard - Show leaderboard');
      console.log('  all        - Show everything');
  }
}

async function listUsers() {
  console.log('\n📋 ALL USERS:\n');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }
  
  if (!profiles || profiles.length === 0) {
    console.log('No users found\n');
    return;
  }
  
  console.log(`Total: ${profiles.length} users\n`);
  profiles.forEach((p, i) => {
    console.log(`${i + 1}. ${p.username}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Email: ${p.email || 'guest'}`);
    console.log(`   Level: ${p.level} | XP: ${p.xp} | Crystals: ${p.crystals}`);
    console.log(`   Created: ${new Date(p.created_at).toLocaleDateString()}`);
    console.log('');
  });
}

async function addTestUser() {
  console.log('\n➕ Adding test user...\n');
  
  const testUser = {
    id: 'test_user_' + Date.now(),
    username: 'TestPlayer',
    email: 'test@hopetheory.app',
    avatar_id: 'default',
    is_guest: false,
    level: 5,
    xp: 250,
    crystals: 100,
  };
  
  const { error } = await supabase.from('profiles').upsert(testUser, { onConflict: 'id' });
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }
  
  console.log('Added:', testUser.username);
  
  const testStats = {
    profile_id: testUser.id,
    total_playtime: 3600,
    total_kills: 1500,
    total_score: 25000,
    highest_wave: 15,
    games_played: 25,
    bugs_smashed: 1500,
  };
  
  const { error: statsError } = await supabase.from('user_stats').upsert(testStats, { onConflict: 'profile_id' });
  if (statsError) console.log('Stats error:', statsError.message);
  else console.log('Stats added');
  
  const testLeaderboard = {
    profile_id: testUser.id,
    score: 25000,
    wave: 15,
  };
  
  const { error: lbError } = await supabase.from('leaderboard').upsert(testLeaderboard, { onConflict: 'profile_id' });
  if (lbError) console.log('Leaderboard error:', lbError.message);
  else console.log('Leaderboard added');
  
  console.log('\n✅ Test user created!\n');
}

async function listStats() {
  console.log('\n📊 PLAYER STATS:\n');
  const { data: stats, error } = await supabase
    .from('user_stats')
    .select('*, profiles(username)')
    .order('total_score', { ascending: false });
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }
  
  if (!stats || stats.length === 0) {
    console.log('No stats found\n');
    return;
  }
  
  stats.forEach((s, i) => {
    console.log(`${i + 1}. ${s.profiles?.username || 'Unknown'}`);
    console.log(`   Score: ${s.total_score} | Wave: ${s.highest_wave}`);
    console.log(`   Kills: ${s.total_kills} | Games: ${s.games_played}`);
    const hours = Math.floor(s.total_playtime / 3600);
    const mins = Math.floor((s.total_playtime % 3600) / 60);
    console.log(`   Playtime: ${hours}h ${mins}m`);
    console.log('');
  });
}

async function showLeaderboard() {
  console.log('\n🏆 GLOBAL LEADERBOARD:\n');
  const { data: lb, error } = await supabase
    .from('leaderboard')
    .select('*, profiles(username, avatar_id)')
    .order('score', { ascending: false })
    .limit(10);
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }
  
  if (!lb || lb.length === 0) {
    console.log('No leaderboard entries\n');
    return;
  }
  
  lb.forEach((entry, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    console.log(`${medal} ${entry.profiles?.username || 'Unknown'}`);
    console.log(`   Score: ${entry.score.toLocaleString()} | Wave: ${entry.wave}`);
    console.log('');
  });
}

main();