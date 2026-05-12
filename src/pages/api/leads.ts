import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdminCookie } from "src/utils/adminAuth";
import { fetchClinicLeads } from "src/server/leadAggregation";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyAdminCookie(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const clinicFilter = typeof req.query.clinic === "string" ? req.query.clinic : "";

  try {
    const { leads, stats } = await fetchClinicLeads(clinicFilter);
    return res.status(200).json({ leads, stats });
  } catch (err) {
    console.error("Supabase select failed:", err);
    if (err instanceof Error && err.message.includes("Supabase not configured")) {
      return res.status(500).json({ error: "Lead storage is not configured" });
    }
    return res.status(500).json({ error: "Failed to load leads" });
  }
}
