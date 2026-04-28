import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://faloknbaathdkmaeodxt.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhbG9rbmJhYXRoZGttYWVvZHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIyNzU0NywiZXhwIjoyMDkyODAzNTQ3fQ.i3hGk8Pib_o1ISX4RHhKXqq90grwci8Wa6GnUGbKajA';

const supabase = createClient(supabaseUrl, serviceKey);

async function configureOAuth() {
  console.log('🔐 Configuring Google OAuth...\n');
  
  // Get from command line args
  const clientId = process.argv[2];
  const clientSecret = process.argv[3];
  
  if (!clientId || !clientSecret) {
    console.log('Usage: node setup-google-oauth.mjs <CLIENT_ID> <CLIENT_SECRET>');
    console.log('Example: node setup-google-oauth.mjs "xxxxx.apps.googleusercontent.com" "xxxxx"');
    process.exit(1);
  }
  
  console.log('Client ID:', clientId);
  console.log('Client Secret:', clientSecret.substring(0, 5) + '...');
  console.log('\n📡 Sending to Supabase...');
  
  try {
    // Use Supabase's config endpoint
    const config = {
      google: {
        enabled: true,
        client_id: clientId,
        client_secret: clientSecret,
        skip_nonce_check: false
      }
    };
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      }
    });
    
    console.log('API Response:', response.status);
    
    // Try alternate method - create config via settings
    const settingsResponse = await fetch(`${supabaseUrl}/auth/v1/config`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        external_google: {
          enabled: true,
          client_id: clientId,
          client_secret: clientSecret
        }
      })
    });
    
    console.log('Settings Response:', settingsResponse.status);
    
    if (settingsResponse.ok || response.ok) {
      console.log('\n✅ Google OAuth configured!');
    } else {
      console.log('\n❌ Configuration may need manual help');
      console.log('Please add these in Supabase Dashboard:');
      console.log(`Client ID: ${clientId}`);
      console.log(`Client Secret: ${clientSecret}`);
    }
  } catch (e) {
    console.log('Error:', e.message);
    console.log('\n⚠️ Please configure manually in Supabase Dashboard');
    console.log(`https://supabase.com/dashboard/project/faloknbaathdkmaeodxt/auth/providers/google`);
  }
}

configureOAuth();