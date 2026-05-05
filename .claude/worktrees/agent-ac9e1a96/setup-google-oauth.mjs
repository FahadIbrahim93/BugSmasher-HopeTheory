import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in local environment.');
  process.exit(1);
}

async function configureOAuth() {
  console.log('Configuring Google OAuth...');

  const clientId = process.argv[2];
  const clientSecret = process.argv[3];

  if (!clientId || !clientSecret) {
    console.log('Usage: node setup-google-oauth.mjs <CLIENT_ID> <CLIENT_SECRET>');
    process.exit(1);
  }

  try {
    const settingsResponse = await fetch(`${supabaseUrl}/auth/v1/config`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_google: {
          enabled: true,
          client_id: clientId,
          client_secret: clientSecret,
        },
      }),
    });

    console.log('Settings response:', settingsResponse.status);

    if (settingsResponse.ok) {
      console.log('Google OAuth configured.');
    } else {
      console.log('Configuration may require manual setup in Supabase Dashboard > Auth > Providers > Google.');
    }
  } catch (e) {
    console.log('Error:', e.message);
    console.log('Configure manually in Supabase Dashboard > Auth > Providers > Google.');
  }
}

configureOAuth();
