import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Lead {
  email: string;
  clinic: string;
  timestamp: string;
  savedAt: string;
}

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');
const LEADS_TMP = LEADS_FILE + '.tmp';

// In-process mutex to serialize read-modify-write operations
let writeLock: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = writeLock.then(fn, fn) as Promise<T>;
  writeLock = result;
  return result;
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
    const result = await withLock(async () => {
      let leads: Lead[] = [];
      try {
        const raw = await fs.promises.readFile(LEADS_FILE, 'utf-8');
        leads = JSON.parse(raw);
      } catch {
        leads = [];
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (leads.some(l => l.email.toLowerCase() === normalizedEmail)) {
        return { duplicate: true };
      }

      leads.push({
        email: email.trim(),
        clinic,
        timestamp,
        savedAt: new Date().toISOString(),
      });

      await fs.promises.mkdir(path.dirname(LEADS_FILE), { recursive: true });
      await fs.promises.writeFile(LEADS_TMP, JSON.stringify(leads, null, 2), 'utf-8');
      await fs.promises.rename(LEADS_TMP, LEADS_FILE);

      return { duplicate: false };
    });

    return res.status(200).json({ success: true, duplicate: result.duplicate });
  } catch (error) {
    console.error('Error saving lead:', error);
    return res.status(500).json({ error: 'Failed to save lead' });
  }
}
