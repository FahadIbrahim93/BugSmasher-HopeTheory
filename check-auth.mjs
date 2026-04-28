import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://faloknbaathdkmaeodxt.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhbG9rbmJhYXRoZGttYWVvZHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIyNzU0NywiZXhwIjoyMDkyODAzNTQ3fQ.i3hGk8Pib_o1ISX4RHhKXqq90grwci8Wa6GnUGbKajA';

const supabase = createClient(supabaseUrl, serviceKey);

async function setupAuth() {
  console.log('Setting up Auth providers...\n');
  
  // Check current config
  const { data: config, error } = await supabase.from('auth.config').select('*').limit(1);
  console.log('Auth config check:', error?.message || 'OK');
  
  // Try to get current auth settings
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/config`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      }
    });
    console.log('Current auth config:', response.status);
  } catch (e) {
    console.log('Could not fetch auth config');
  }
  
  // List current users
  const { data: profiles } = await supabase.from('profiles').select('id, username, email').limit(5);
  console.log('\nCurrent profiles:', profiles?.length || 0);
  if (profiles) {
    profiles.forEach(p => console.log(`  - ${p.username}: ${p.email || 'no email'}`));
  }
  
  // Check user_stats
  const { data: stats } = await supabase.from('user_stats').select('profile_id, total_score, highest_wave').limit(5);
  console.log('\nUser stats:', stats?.length || 0);
}

setupAuth();