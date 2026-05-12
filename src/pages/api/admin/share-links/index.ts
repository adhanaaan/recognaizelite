import type { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "crypto";
import { verifyAdminCookie } from "src/utils/adminAuth";
import { getSupabaseAdmin, PartnerShareLinkRow } from "src/utils/supabase";
import { KNOWN_CLINICS } from "src/server/leadAggregation";

function generateToken(): string {
  // 16 bytes = 128 bits = 22 base64url chars. Unguessable, unenumerable,
  // short enough for a sane URL.
  return randomBytes(16).toString("base64url");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  if (!verifyAdminCookie(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error("Supabase not configured:", err);
    return res.status(500).json({ error: "Share-link storage is not configured" });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("partner_share_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to list share links:", error);
      return res.status(500).json({ error: "Failed to load share links" });
    }
    return res.status(200).json({ links: (data ?? []) as PartnerShareLinkRow[] });
  }

  if (req.method === "POST") {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      return res.status(400).json({ error: "Content-Type must be application/json" });
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const clinic = typeof body.clinic === "string" ? body.clinic.trim() : "";
    if (!(KNOWN_CLINICS as readonly string[]).includes(clinic)) {
      return res.status(400).json({ error: "Unknown clinic" });
    }
    const labelRaw = typeof body.label === "string" ? body.label.trim() : "";
    const label = labelRaw.length > 0 ? labelRaw.slice(0, 120) : null;

    // Retry on the (vanishingly small) chance of a token collision.
    for (let attempt = 0; attempt < 3; attempt++) {
      const token = generateToken();
      const { data, error } = await supabase
        .from("partner_share_links")
        .insert({ clinic, token, label })
        .select()
        .single();

      if (!error && data) {
        return res.status(200).json({ link: data as PartnerShareLinkRow });
      }
      if (error && error.code !== "23505") {
        // Not a unique-violation — real failure.
        console.error("Failed to create share link:", error);
        return res.status(500).json({ error: "Failed to create share link" });
      }
      // 23505 → token collision; loop and retry.
    }

    return res.status(500).json({ error: "Failed to generate a unique token" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
