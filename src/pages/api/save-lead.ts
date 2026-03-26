import type { NextApiRequest, NextApiResponse } from 'next';
import { put, list } from '@vercel/blob';

interface Lead {
  email: string;
  clinic: string;
  timestamp: string;
  savedAt: string;
}

const BLOB_NAME = 'leads.json';

async function getLeads(): Promise<Lead[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_NAME });
    const blob = blobs.find(b => b.pathname === BLOB_NAME);
    if (!blob) return [];
    const res = await fetch(blob.url);
    return await res.json();
  } catch {
    return [];
  }
}

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

  try {
    const leads = await getLeads();

    const normalizedEmail = email.trim().toLowerCase();
    if (leads.some(l => l.email.toLowerCase() === normalizedEmail)) {
      return res.status(200).json({ success: true, duplicate: true });
    }

    leads.push({
      email: email.trim(),
      clinic,
      timestamp,
      savedAt: new Date().toISOString(),
    });

    await put(BLOB_NAME, JSON.stringify(leads, null, 2), {
      access: 'public',
      addRandomSuffix: false,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving lead:', error);
    return res.status(500).json({ error: 'Failed to save lead' });
  }
}
