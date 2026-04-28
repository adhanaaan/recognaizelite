import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdminCookie } from "src/utils/adminAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdminCookie(req)) {
    return res.status(401).json({ error: "Unauthorized — log in at /admin/login first" });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(500).json({ error: "Supabase env vars not set" });
  }

  const sql = `
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS health_goal text;
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS takes_supplements text;
  `;

  const resp = await fetch(`${url}/rest/v1/rpc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  // If the RPC approach doesn't work, try the SQL endpoint directly
  if (!resp.ok) {
    const pgResp = await fetch(`${url}/pg/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!pgResp.ok) {
      // Last resort: try individual column adds via PostgREST schema refresh
      const results: string[] = [];
      for (const col of ["health_goal", "takes_supplements"]) {
        try {
          const testInsert = await fetch(`${url}/rest/v1/leads?select=${col}&limit=1`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
          });
          if (testInsert.ok) {
            results.push(`${col}: already exists`);
          } else {
            results.push(`${col}: needs manual creation`);
          }
        } catch {
          results.push(`${col}: check failed`);
        }
      }
      return res.status(200).json({
        message: "Auto-migration not supported on this Supabase plan. Please run the SQL manually.",
        instructions: "Go to supabase.com → your project → SQL Editor → run: ALTER TABLE public.leads ADD COLUMN health_goal text; ALTER TABLE public.leads ADD COLUMN takes_supplements text;",
        columnStatus: results,
      });
    }

    const pgData = await pgResp.json().catch(() => null);
    return res.status(200).json({ success: true, method: "pg", detail: pgData });
  }

  const data = await resp.json().catch(() => null);
  return res.status(200).json({ success: true, method: "rpc", detail: data });
}
