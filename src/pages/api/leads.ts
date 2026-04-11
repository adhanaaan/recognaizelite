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

  const clinicFilter = typeof req.query.clinic === "string" ? req.query.clinic : "sjmc";

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("clinic", clinicFilter)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase select failed:", error);
    return res.status(500).json({ error: "Failed to load leads" });
  }

  const leads = (data ?? []) as LeadRow[];
  return res.status(200).json({ leads, stats: computeStats(leads) });
}
