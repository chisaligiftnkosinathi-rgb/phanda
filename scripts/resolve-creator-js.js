const fs = require('fs');
const path = require('path');

// Basic manual dotenv parsing
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
}

async function resolveCreator() {
  loadEnv();
  
  const email = process.env.CREATOR_EMAIL || 'glegacy97@gmail.com';
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key");
    process.exit(1);
  }

  console.log(`Resolving creator identity for: ${email}`);
  
  try {
    const url = `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=*`;
    
    // We can use global fetch if node >= 18
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!response.ok) {
        console.error("Failed to query supabase:", await response.text());
        return;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const profile = data[0];
      console.log(`\n✅ Profile found!`);
      console.log(`Canonical UUID: ${profile.id}`);
      console.log(`Email: ${profile.email}`);
      console.log(`Role: ${profile.role}`);
      console.log(`Display Name: ${profile.full_name || profile.username}`);
      console.log(`Status: ${profile.is_active ? 'Active' : 'Inactive'}`);
      console.log(`Billing Policy: ${profile.billing_policy || 'None'}`);
    } else {
      console.log(`\n❌ Profile NOT found for ${email}`);
      console.log(`Action Required: Seed creator account.`);
    }
  } catch (err) {
      console.error("Error querying Supabase:", err);
  }
}

resolveCreator().catch(console.error);
