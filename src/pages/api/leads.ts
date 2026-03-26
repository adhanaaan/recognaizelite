import type { NextApiRequest, NextApiResponse } from 'next';
import { get as getBlob } from '@vercel/blob';

const BLOB_NAME = 'leads.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await getBlob(BLOB_NAME, { access: 'private' });
    if (!result || result.statusCode === 304) return res.status(200).json({ leads: [] });
    const text = await new Response(result.stream).text();
    const leads = JSON.parse(text);
    return res.status(200).json({ leads });
  } catch {
    return res.status(200).json({ leads: [] });
  }
}
