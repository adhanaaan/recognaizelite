import type { SupabaseClient } from "@supabase/supabase-js";
import { LITE_TABLES, liteTableFor } from "src/server/liteFunnels";
import { getSupabaseAdmin, LeadRow } from "src/utils/supabase";

/**
 * Server-only lead aggregation: queries the per-clinic tables, normalizes
 * rows to the unified LeadRow shape, and computes summary stats. Shared by
 * the admin reader (`/api/leads`) and the public partner share endpoint
 * (`/api/partner/share-leads`) so both render the same data. Never import
 * this from client code — it relies on the Supabase service-role key.
 */

export const KNOWN_CLINICS = ["sjmc", "hookikigai", "healthtechx", "tcmbrain", "novi", "liteone", "liteworldalz", "liteclinician", "litetwo", "act4health", "litebcgolf", "liteevent"] as const;
export type KnownClinic = (typeof KNOWN_CLINICS)[number];

export interface LeadStats {
  total: number;
  today: number;
  avgScore: number | null;
  byGender: Record<string, number>;
  byAgeRange: Record<string, number>;
  /**
   * Rows that carry contact details. Equal to `total` for every funnel that
   * only writes on submit; lower for `liteone`, where a row is created when the
   * game ends. The gap is the form's drop-off.
   */
  withContact: number;
}

export function computeStats(leads: LeadRow[]): LeadStats {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  let total = 0;
  let today = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  let withContact = 0;
  const byGender: Record<string, number> = {};
  const byAgeRange: Record<string, number> = {};

  for (const lead of leads) {
    total++;
    if (lead.email) withContact++;
    if (new Date(lead.created_at).getTime() >= todayMs) today++;
    if (typeof lead.score === "number") {
      scoreSum += lead.score;
      scoreCount++;
    }
    if (lead.gender) byGender[lead.gender] = (byGender[lead.gender] || 0) + 1;
    if (lead.age_range) byAgeRange[lead.age_range] = (byAgeRange[lead.age_range] || 0) + 1;
  }

  return {
    total,
    today,
    avgScore: scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : null,
    byGender,
    byAgeRange,
    withContact,
  };
}

// Per-table row normalizers. Each maps the raw table shape to the unified
// LeadRow contract by filling the columns that table doesn't have with null.

function normalizeLegacyLeadsRow(row: any): LeadRow {
  return {
    id: row.id,
    email: row.email,
    email_lower: row.email_lower,
    clinic: row.clinic,
    age_range: row.age_range ?? null,
    gender: row.gender ?? null,
    whatsapp: row.whatsapp ?? null,
    score: row.score ?? null,
    percentile: row.percentile ?? null,
    severity: row.severity ?? null,
    utm_source: row.utm_source ?? null,
    utm_medium: row.utm_medium ?? null,
    utm_campaign: row.utm_campaign ?? null,
    referrer: row.referrer ?? null,
    user_agent: row.user_agent ?? null,
    ip_region: row.ip_region ?? null,
    health_goal: row.health_goal ?? null,
    takes_supplements: row.takes_supplements ?? null,
    role: null,
    organization: null,
    organization_type: null,
    cognitive_interest: null,
    dampness_index: null,
    blood_stasis_index: null,
    created_at: row.created_at,
    completed_at: row.completed_at ?? null,
  };
}

function normalizeHookikigaiRow(row: any): LeadRow {
  return {
    id: row.id,
    email: row.email,
    email_lower: row.email_lower,
    clinic: "hookikigai",
    age_range: row.age_range ?? null,
    gender: row.gender ?? null,
    whatsapp: row.whatsapp ?? null,
    score: row.score ?? null,
    percentile: row.percentile ?? null,
    severity: row.severity ?? null,
    utm_source: row.utm_source ?? null,
    utm_medium: row.utm_medium ?? null,
    utm_campaign: row.utm_campaign ?? null,
    referrer: row.referrer ?? null,
    user_agent: row.user_agent ?? null,
    ip_region: row.ip_region ?? null,
    health_goal: row.health_goal ?? null,
    takes_supplements: null,
    role: null,
    organization: null,
    organization_type: null,
    cognitive_interest: null,
    dampness_index: null,
    blood_stasis_index: null,
    created_at: row.created_at,
    completed_at: row.completed_at ?? null,
  };
}

function normalizeDemoRow(row: any): LeadRow {
  return {
    id: row.id,
    email: row.email,
    email_lower: row.email_lower,
    clinic: "healthtechx",
    age_range: null,
    gender: null,
    whatsapp: row.whatsapp ?? null,
    score: row.score ?? null,
    percentile: row.percentile ?? null,
    severity: row.severity ?? null,
    utm_source: row.utm_source ?? null,
    utm_medium: row.utm_medium ?? null,
    utm_campaign: row.utm_campaign ?? null,
    referrer: row.referrer ?? null,
    user_agent: row.user_agent ?? null,
    ip_region: row.ip_region ?? null,
    health_goal: null,
    takes_supplements: null,
    role: row.role ?? null,
    organization: row.organization ?? null,
    organization_type: row.organization_type ?? null,
    cognitive_interest: row.cognitive_interest ?? null,
    dampness_index: null,
    blood_stasis_index: null,
    created_at: row.created_at,
    completed_at: row.completed_at ?? null,
  };
}

function normalizeTcmbrainRow(row: any): LeadRow {
  return {
    id: row.id,
    email: row.email,
    email_lower: row.email_lower,
    clinic: "tcmbrain",
    age_range: row.age_range ?? null,
    gender: row.gender ?? null,
    whatsapp: row.whatsapp ?? null,
    score: row.score ?? null,
    percentile: row.percentile ?? null,
    severity: row.severity ?? null,
    utm_source: row.utm_source ?? null,
    utm_medium: row.utm_medium ?? null,
    utm_campaign: row.utm_campaign ?? null,
    referrer: row.referrer ?? null,
    user_agent: row.user_agent ?? null,
    ip_region: row.ip_region ?? null,
    health_goal: null,
    takes_supplements: null,
    role: null,
    organization: null,
    organization_type: null,
    cognitive_interest: null,
    dampness_index: row.dampness_index ?? null,
    blood_stasis_index: row.blood_stasis_index ?? null,
    created_at: row.created_at,
    completed_at: row.completed_at ?? null,
  };
}

/**
 * ReCOGnAIze Lite and its copies — every table in the LITE_TABLES registry.
 * These tables have no `clinic` column — each holds exactly one funnel, so the
 * caller supplies the label — and unlike every sibling table a row can exist
 * with no email at all: /api/lite-attempt writes one the moment the game ends,
 * and `completed_at` is filled in later if the visitor submits the form.
 *
 * They share a column layout on purpose (migrations 010/012/014), so one
 * normalizer serves all of them.
 */
function normalizeLiteRow(row: any, clinic: string): LeadRow {
  return {
    id: row.id,
    email: row.email ?? null,
    email_lower: row.email_lower ?? null,
    clinic,
    age_range: row.age_range ?? null,
    gender: row.gender ?? null,
    whatsapp: row.whatsapp ?? null,
    score: row.score ?? null,
    percentile: row.percentile ?? null,
    severity: row.severity ?? null,
    utm_source: row.utm_source ?? null,
    utm_medium: row.utm_medium ?? null,
    utm_campaign: row.utm_campaign ?? null,
    referrer: row.referrer ?? null,
    user_agent: row.user_agent ?? null,
    ip_region: row.ip_region ?? null,
    health_goal: null,
    takes_supplements: null,
    role: null,
    organization: null,
    organization_type: null,
    cognitive_interest: null,
    dampness_index: null,
    blood_stasis_index: null,
    created_at: row.created_at,
    completed_at: row.completed_at ?? null,
  };
}

export interface ClinicLeadsResult {
  leads: LeadRow[];
  stats: LeadStats;
}

/** One lite funnel's table, normalized under its own clinic label. */
function liteSource(
  supabase: SupabaseClient,
  clinic: string,
  table: string
): PromiseLike<LeadRow[]> {
  return supabase
    .from(table)
    .select("*")
    .then(({ data, error }) => {
      if (error) throw error;
      return (data ?? []).map((row) => normalizeLiteRow(row, clinic));
    });
}

/** Every lite funnel's table, for the unfiltered "All" view. */
function liteSources(supabase: SupabaseClient): PromiseLike<LeadRow[]>[] {
  return Object.entries(LITE_TABLES).map(([clinic, table]) =>
    liteSource(supabase, clinic, table)
  );
}

/**
 * Fetch leads + stats for a given clinic filter.
 *
 * - "" or "all" → union across every per-clinic table
 * - "sjmc" → only public.leads WHERE clinic = 'sjmc'
 * - "hookikigai" → public.leads WHERE clinic = 'hookikigai' UNION public.hookikigai_leads
 *   (legacy hookikigai rows still live in `leads` from before the split-out)
 * - "healthtechx" → public.demo_leads
 * - "tcmbrain" → public.tcmbrain_leads
 * - "novi" → public.leads WHERE clinic = 'novi'
 * - any lite funnel ("liteone", "liteworldalz", "liteclinician", "litetwo",
 *   "act4health", "litebcgolf") →
 *   its own table from the LITE_TABLES registry; rows may have no email yet
 * - unknown clinic → empty result (caller decides 404 vs. permissive empty)
 */
export async function fetchClinicLeads(clinic: string): Promise<ClinicLeadsResult> {
  const supabase = getSupabaseAdmin();
  const sources: PromiseLike<LeadRow[]>[] = [];

  if (!clinic || clinic === "all") {
    sources.push(
      supabase.from("leads").select("*").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeLegacyLeadsRow);
      }),
      supabase.from("hookikigai_leads").select("*").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeHookikigaiRow);
      }),
      supabase.from("demo_leads").select("*").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeDemoRow);
      }),
      supabase.from("tcmbrain_leads").select("*").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeTcmbrainRow);
      }),
      // liteone used to ride along in the unfiltered `leads` select above. Now
      // that the lite funnels have their own tables they have to be named here
      // or they drop out of "All" — driven off the registry so a new funnel
      // appears in the union the moment it is added there.
      ...liteSources(supabase),
    );
  } else if (clinic === "sjmc") {
    sources.push(
      supabase.from("leads").select("*").eq("clinic", "sjmc").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeLegacyLeadsRow);
      }),
    );
  } else if (clinic === "hookikigai") {
    sources.push(
      supabase.from("leads").select("*").eq("clinic", "hookikigai").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeLegacyLeadsRow);
      }),
      supabase.from("hookikigai_leads").select("*").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeHookikigaiRow);
      }),
    );
  } else if (clinic === "healthtechx") {
    sources.push(
      supabase.from("demo_leads").select("*").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeDemoRow);
      }),
    );
  } else if (clinic === "tcmbrain") {
    sources.push(
      supabase.from("tcmbrain_leads").select("*").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeTcmbrainRow);
      }),
    );
  } else if (clinic === "novi") {
    sources.push(
      supabase.from("leads").select("*").eq("clinic", "novi").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeLegacyLeadsRow);
      }),
    );
  } else if (liteTableFor(clinic)) {
    sources.push(liteSource(supabase, clinic, liteTableFor(clinic)!));
  } else {
    return { leads: [], stats: computeStats([]) };
  }

  const buckets = await Promise.all(sources);
  const leads = buckets.flat();
  leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return { leads, stats: computeStats(leads) };
}
