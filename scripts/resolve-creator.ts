import { PhandaIdentityProvider } from '../src/adapters/identity/PhandaIdentityProvider';
import { ENV } from '../src/config/env';

// For this script, we can mock or ensure ENV has the SUPABASE URL if needed,
// but Supabase client will rely on EXPO_PUBLIC_SUPABASE_URL from .env.
// Let's manually provide it if not present so ts-node works outside Expo.
if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  require('dotenv').config();
}

async function resolveCreator() {
  const email = process.env.CREATOR_EMAIL || 'glegacy97@gmail.com';
  console.log(`Resolving creator identity for: ${email}`);

  const provider = new PhandaIdentityProvider();
  const profile = await provider.resolveActor(email);

  if (profile) {
    console.log(`\n✅ Profile found!`);
    console.log(`Canonical UUID: ${profile.id}`);
    console.log(`Role: ${profile.role}`);
    console.log(`Display Name: ${profile.displayName}`);
    console.log(`Status: ${profile.isActive ? 'Active' : 'Inactive'}`);
  } else {
    console.log(`\n❌ Profile NOT found for ${email}`);
    console.log(`Action Required: Seed creator account.`);
  }
}

resolveCreator().catch(console.error);
