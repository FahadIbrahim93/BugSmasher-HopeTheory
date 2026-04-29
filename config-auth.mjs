import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in local environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function configureAuth() {
  console.log('Configuring Supabase Auth...');

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    if (response.ok) {
      const settings = await response.json();
      console.log('Current settings:', JSON.stringify(settings, null, 2));
    } else {
      console.log('Settings response:', response.status, await response.text());
    }
  } catch (e) {
    console.log('Could not fetch settings:', e.message);
  }

  const testUser = {
    email: 'player1@bugsmasher.game',
    password: 'GamePassword123!',
    email_confirm: true,
    user_metadata: { username: 'PlayerOne' },
  };

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const result = await response.json();
    console.log('Admin create response:', response.status);
    console.log(JSON.stringify(result, null, 2));

    if (result.id) {
      console.log('User created. ID:', result.id);

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: result.id,
          username: 'PlayerOne',
          email: testUser.email,
          avatar_id: 'default',
          is_guest: false,
          level: 1,
          xp: 0,
          crystals: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      if (profileError) {
        console.log('Profile error:', profileError.message);
      } else {
        console.log('Profile created.');
      }

      await supabase.from('user_stats').upsert(
        {
          profile_id: result.id,
          total_playtime: 0,
          total_kills: 0,
          total_score: 0,
          highest_wave: 0,
          games_played: 0,
        },
        { onConflict: 'profile_id' },
      );

      await supabase.from('leaderboard').upsert(
        {
          profile_id: result.id,
          score: 0,
          wave: 0,
        },
        { onConflict: 'profile_id' },
      );
    }
  } catch (e) {
    console.log('Error creating user:', e.message);
  }

  console.log('Configuration complete.');
}

configureAuth()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log('Error:', e.message);
    process.exit(1);
  });
