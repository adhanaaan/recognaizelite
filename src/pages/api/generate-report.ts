import type { NextApiRequest, NextApiResponse } from 'next';
import { buildFullReport, buildShortReport } from 'src/server/report';
import { validateResultData, sanitizeResultData, ValidationError } from 'src/server/validation';

/**
 * Secured API endpoint for report generation
 * - Validates input data to prevent tampering
 * - Uses server-only code that's never exposed to client
 * - Includes proper error handling and security headers
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Method validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Content-Type validation
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  const { result, clinic } = req.body;

  // Check if result data exists
  if (!result) {
    return res.status(400).json({ error: 'Missing result data' });
  }

  // Allowlist clinic to known values; anything else is dropped silently so
  // the request still succeeds (falls back to default 30s norms).
  const ALLOWED_CLINICS = new Set(['sjmc', 'hookikigai', 'healthtechx', 'tcmbrain', 'novi']);
  const safeClinic =
    typeof clinic === 'string' && ALLOWED_CLINICS.has(clinic) ? clinic : undefined;

  try {
    // Validate the result data structure and values
    validateResultData(result);

    // Sanitize the data to remove any extra fields
    const sanitizedResult = sanitizeResultData(result);

    // Generate reports using server-only algorithms
    const shortReport = buildShortReport(sanitizedResult, safeClinic);
    const fullReport = buildFullReport(sanitizedResult);

    // Check if reports were successfully generated
    if (!shortReport && !fullReport) {
      return res.status(400).json({ 
        error: 'Insufficient data to generate report',
        details: 'Please complete all required tasks'
      });
    }

    return res.status(200).json({ 
      shortReport, 
      fullReport,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    // Handle validation errors separately
    if (error instanceof ValidationError) {
      console.warn('Validation error:', error.message);
      return res.status(400).json({ 
        error: 'Invalid result data',
        details: error.message
      });
    }

    // Handle other errors
    console.error('Error generating report:', error);
    return res.status(500).json({ 
      error: 'Failed to generate report',
      details: 'An internal error occurred'
    });
  }
}
