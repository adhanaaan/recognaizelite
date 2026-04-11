import type { NextApiRequest, NextApiResponse } from "next";
import { clearAdminCookie } from "src/utils/adminAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  clearAdminCookie(res);
  return res.status(204).end();
}
