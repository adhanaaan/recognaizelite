import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdminCookie } from "src/utils/adminAuth";
import { getSupabaseAdmin, PartnerShareLinkRow } from "src/utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  if (!verifyAdminCookie(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = typeof req.query.id === "string" ? req.query.id : "";
  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  // Only "revoke" is supported for now. Pass {"action":"revoke"} or {"action":"reinstate"}.
  const action = typeof body.action === "string" ? body.action : "revoke";

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error("Supabase not configured:", err);
    return res.status(500).json({ error: "Share-link storage is not configured" });
  }

  const patch =
    action === "reinstate"
      ? { revoked_at: null }
      : { revoked_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from("partner_share_links")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("Failed to update share link:", error);
    return res.status(500).json({ error: "Failed to update share link" });
  }

  return res.status(200).json({ link: data as PartnerShareLinkRow });
}
