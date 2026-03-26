import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  const { email, clinic, timestamp } = req.body;

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!clinic || typeof clinic !== 'string') {
    return res.status(400).json({ error: 'Missing clinic identifier' });
  }
  if (!timestamp || typeof timestamp !== 'string' || isNaN(Date.parse(timestamp))) {
    return res.status(400).json({ error: 'Invalid timestamp' });
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('GOOGLE_SHEETS_WEBHOOK_URL is not configured');
    return res.status(500).json({ error: 'Lead storage not configured' });
  }

  try {
    const payload = {
      email: email.trim(),
      clinic,
      timestamp,
      savedAt: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Google Sheets webhook returned ${response.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving lead:', error);
    return res.status(500).json({ error: 'Failed to save lead' });
  }
}
