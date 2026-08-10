import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service-role key.
// IMPORTANT: Never import this file from client-side code — the service-role
// key grants full access and must never be shipped to the browser.

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase env vars missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export interface LeadRow {
  id: string;
  // Nullable since migration 008 (SJMC accepts WhatsApp-only leads) and again
  // for `liteone`, where a row is written when the game ends — before any
  // contact details exist. Always guard before calling string methods on it.
  email: string | null;
  email_lower: string | null;
  clinic: string;
  age_range: string | null;
  gender: string | null;
  whatsapp: string | null;
  score: number | null;
  percentile: number | null;
  severity: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_region: string | null;
  health_goal: string | null;
  takes_supplements: string | null;
  // HealthTechX (`demo_leads`) qualifier fields. Null for sjmc/hookikigai rows.
  role: string | null;
  organization: string | null;
  organization_type: string | null;
  cognitive_interest: string | null;
  // TCM Brain (`tcmbrain_leads`) indices. 1-10. Null for non-tcmbrain rows.
  dampness_index: number | null;
  blood_stasis_index: number | null;
  created_at: string;
  // ReCOGnAIze Lite (`liteone_leads`): set when the visitor submits the form.
  // Null means they finished the game but abandoned the form. Null for every
  // other clinic, which has no row until submit.
  completed_at: string | null;
}

// `partner_share_links` row. Token-in-URL bearer credential for the
// partner-facing /share/[clinic]/[token] page. Plaintext token is fine
// at this scale; admin can revoke individual rows via `revoked_at`.
export interface PartnerShareLinkRow {
  id: string;
  clinic: string;
  token: string;
  label: string | null;
  created_at: string;
  last_accessed_at: string | null;
  revoked_at: string | null;
}

export const AGE_RANGES = ["18-25", "26-35", "36-45", "46-55", "56-65", "66+"] as const;
export const GENDERS = ["male", "female", "prefer_not_to_say"] as const;

export type AgeRange = (typeof AGE_RANGES)[number];
export type Gender = (typeof GENDERS)[number];
