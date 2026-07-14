import { supabase } from '../src/api/supabase';
import { ENV } from '../src/config/env';

// For execution outside of Expo, we ensure env variables are loaded
if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  require('dotenv').config();
}

async function seedCreator() {
  const email = process.env.CREATOR_EMAIL || 'glegacy97@gmail.com';
  console.log(`[Seed] Checking existence of creator: ${email}`);

  // 1. Check if creator already exists in public.profiles
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (fetchError) {
    console.error(`[Seed] Error fetching profile: ${fetchError.message}`);
    process.exit(1);
  }

  if (existingProfile) {
    console.log(`[Seed] Creator already exists. Seeding skipped.`);
    console.log(`[Seed] Canonical UUID: ${existingProfile.id}`);
    return;
  }

  // 2. If it does not exist, we create the user via Supabase Auth
  // (which usually triggers a trigger to create the public.profiles record)
  // or we insert directly if this is a simplified setup.
  console.log(`[Seed] Creator not found. Seeding new creator identity...`);

  // We generate a secure random password for the seed account.
  // The creator can trigger a password reset via email if needed.
  const tempPassword = `Seed_AXIONYX_${Math.random().toString(36).slice(-8)}!`;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: tempPassword,
    options: {
      data: {
        full_name: 'Platform Creator',
        role: 'creator' // Initial admin/creator role
      }
    }
  });

  if (authError) {
    console.error(`[Seed] Auth creation failed: ${authError.message}`);
    process.exit(1);
  }

  if (authData.user) {
    console.log(`\n✅ Creator Seeded Successfully!`);
    console.log(`Canonical UUID: ${authData.user.id}`);
    console.log(`Email: ${authData.user.email}`);
    console.log(`Temporary Password: ${tempPassword}`);
    console.log(`\nPlease save this UUID in your operational documentation.`);
  } else {
    console.log(`[Seed] User creation returned no data (possibly email confirmation required).`);
  }
}

seedCreator().catch(console.error);
