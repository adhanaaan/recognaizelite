import type { NextApiRequest, NextApiResponse } from "next";
import { setAdminCookie, verifyPassword } from "src/utils/adminAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const contentType = req.headers["content-type"];
  if (!contentType || !contentType.includes("application/json")) {
    return res.status(400).json({ error: "Content-Type must be application/json" });
  }

  const password = (req.body as Record<string, unknown>)?.password;
  if (typeof password !== "string") {
    return res.status(400).json({ error: "Missing password" });
  }

  let ok = false;
  try {
    ok = verifyPassword(password);
  } catch (err) {
    console.error("Admin auth not configured:", err);
    return res.status(500).json({ error: "Admin auth is not configured" });
  }

  if (!ok) {
    // Small delay to blunt brute-force.
    await new Promise((r) => setTimeout(r, 800));
    return res.status(401).json({ error: "Invalid password" });
  }

  setAdminCookie(res);
  return res.status(200).json({ success: true });
}
