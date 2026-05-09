import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdminCookie } from "src/utils/adminAuth";
import { getSupabaseAdmin, LeadRow } from "src/utils/supabase";

interface Stats {
  total: number;
  today: number;
  avgScore: number | null;
  byGender: Record<string, number>;
  byAgeRange: Record<string, number>;
}

function computeStats(leads: LeadRow[]): Stats {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  let total = 0;
  let today = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  const byGender: Record<string, number> = {};
  const byAgeRange: Record<string, number> = {};

  for (const lead of leads) {
    total++;
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
  };
}

// Normalizers map per-clinic table rows to the unified LeadRow shape so
// the admin UI can render them uniformly.

function normalizeLegacyLeadsRow(row: any): LeadRow {
  return {
    id: row.id,
    email: row.email,
    email_lower: row.email_lower,
    clinic: row.clinic,
    age_range: row.age_range ?? null,
    gender: row.gender ?? null,
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
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyAdminCookie(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error("Supabase not configured:", err);
    return res.status(500).json({ error: "Lead storage is not configured" });
  }

  const clinicFilter = typeof req.query.clinic === "string" ? req.query.clinic : "";

  // Build the source list based on the requested clinic.
  // Legacy `leads` still holds historical hookikigai rows (kept for safety after the
  // 003_hookikigai_leads.sql backfill copy), so the hookikigai filter unions both.
  const sources: PromiseLike<LeadRow[]>[] = [];

  if (!clinicFilter || clinicFilter === "all") {
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
    );
  } else if (clinicFilter === "sjmc") {
    sources.push(
      supabase.from("leads").select("*").eq("clinic", "sjmc").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeLegacyLeadsRow);
      }),
    );
  } else if (clinicFilter === "hookikigai") {
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
  } else if (clinicFilter === "healthtechx") {
    sources.push(
      supabase.from("demo_leads").select("*").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeDemoRow);
      }),
    );
  } else if (clinicFilter === "tcmbrain") {
    sources.push(
      supabase.from("tcmbrain_leads").select("*").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map(normalizeTcmbrainRow);
      }),
    );
  } else {
    // Unknown clinic — return empty rather than 400, mirrors prior permissive behavior.
    return res.status(200).json({ leads: [], stats: computeStats([]) });
  }

  let leads: LeadRow[];
  try {
    const buckets = await Promise.all(sources);
    leads = buckets.flat();
    leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (err) {
    console.error("Supabase select failed:", err);
    return res.status(500).json({ error: "Failed to load leads" });
  }

  return res.status(200).json({ leads, stats: computeStats(leads) });
}
