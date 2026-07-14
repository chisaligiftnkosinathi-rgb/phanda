import { IdentityProvider } from "@axionyx/ports";
import { BillingPolicy } from "@axionyx/contracts";
import { supabase } from "../../api/supabase";
import { apiClient } from "../../api/client";

export class PhandaIdentityProvider implements IdentityProvider {
  async resolveActor(actorId: string): Promise<{ id: string; role: string; isActive: boolean; displayName?: string; billingPolicy?: BillingPolicy } | null> {
    console.log(`[Adapter] PhandaIdentityProvider resolving actor: ${actorId}`);

    try {
      // 1. Query Phanda for the user
      // Support looking up by email (e.g. glegacy97@gmail.com) as the initial key
      const isEmail = actorId.includes('@');
      
      let profile = null;

      if (isEmail) {
        // Retrieve canonical profile by email
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', actorId)
          .maybeSingle();
          
        if (error) console.error('[PhandaIdentityProvider] DB error:', error);
        profile = data;
      } else {
        // Retrieve canonical profile by ID
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', actorId)
          .maybeSingle();
          
        if (error) console.error('[PhandaIdentityProvider] DB error:', error);
        profile = data;
        
        // Fallback to backend API if not found via direct Supabase query
        if (!profile) {
          try {
            const response = await apiClient.get(`profiles/${actorId}`);
            profile = response.data;
          } catch (apiErr) {
            // ignore API 404
          }
        }
      }

      // If the profile does not exist, return null
      // (This triggers the operational decision to seed or require registration)
      if (!profile) {
        console.warn(`[PhandaIdentityProvider] Profile not found for ${actorId}. Seed required.`);
        return null;
      }

      // Supply the canonical profile through the IdentityProvider port
      // Default to STANDARD if the DB doesn't specify an exemption
      const billingPolicy = profile.billing_policy 
          ? (profile.billing_policy as BillingPolicy) 
          : BillingPolicy.STANDARD;

      return {
        id: profile.id,
        role: profile.system_role || "creator",
        isActive: profile.is_active !== false,
        displayName: profile.full_name || profile.display_name || actorId,
        billingPolicy
      };

    } catch (err) {
      console.error(`[PhandaIdentityProvider] Failed to resolve actor ${actorId}:`, err);
      return null;
    }
  }
}
