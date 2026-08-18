/**
 * Server-only Resend client.
 *
 * Two endpoints of the Resend REST API, called with plain `fetch` rather than
 * the `resend` SDK: the surface used here is small and stable, and keeping it
 * dependency-free means there is no way for an API key to be pulled into a
 * client bundle by an errant import. Swap in the SDK if the surface grows.
 *
 * IMPORTANT: never import this from client-side code — RESEND_API_KEY grants
 * full send rights on the verified domain.
 *
 * Every function here degrades rather than throws. Email is downstream of lead
 * capture: a missing key, a Resend outage or a rejected address must never turn
 * a captured lead into a failed submit.
 */

const API_BASE = "https://api.resend.com";

/** Bounds the worst case a visitor waits on the form's submit button. */
const REQUEST_TIMEOUT_MS = 4000;

export type ResendConfig = {
  apiKey: string;
  /** e.g. "Recog-Lite <results@yourdomain.com>". Domain must be verified. */
  from: string;
  /** Optional: without it, contacts are not synced and sends still work. */
  audienceId: string | null;
  /** Optional: where bounces and human replies land. */
  replyTo: string | null;
};

/**
 * Reads config from the environment. Returns null — not an error — when the
 * integration simply isn't set up, so preview deploys and local dev capture
 * leads without needing credentials.
 */
export function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) return null;

  return {
    apiKey,
    from,
    audienceId: process.env.RESEND_AUDIENCE_ID || null,
    replyTo: process.env.RESEND_REPLY_TO || null,
  };
}

type ResendResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function resendFetch<T>(
  config: ResendConfig,
  path: string,
  body: unknown
): Promise<ResendResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      // Resend returns { name, message } on failure. Surface the message so a
      // misconfigured `from` domain is diagnosable from the function logs
      // rather than looking like a silent no-op.
      const message =
        (payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message: unknown }).message)
          : null) ?? `HTTP ${res.status}`;
      return { ok: false, error: message };
    }

    return { ok: true, data: payload as T };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return { ok: false, error: aborted ? `timed out after ${REQUEST_TIMEOUT_MS}ms` : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Resend tags — filterable in their dashboard. Values must be ASCII. */
  tags?: { name: string; value: string }[];
};

/** Returns the Resend message id on success, or null if the send didn't happen. */
export async function sendEmail(
  config: ResendConfig,
  input: SendEmailInput
): Promise<{ id: string } | null> {
  const result = await resendFetch<{ id: string }>(config, "/emails", {
    from: config.from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    ...(config.replyTo ? { reply_to: config.replyTo } : {}),
    ...(input.tags ? { tags: input.tags } : {}),
  });

  if (!result.ok) {
    console.error("Resend send failed:", result.error);
    return null;
  }
  return result.data?.id ? { id: result.data.id } : null;
}

/**
 * Adds a contact to the configured Audience — this is the list the campaign
 * broadcasts go to, and it is what gives those broadcasts Resend's unsubscribe
 * handling.
 *
 * Resend upserts on email within an audience, so re-sending an existing contact
 * is safe and needs no local dedup.
 */
export async function addContactToAudience(
  config: ResendConfig,
  contact: { email: string; firstName?: string | null }
): Promise<boolean> {
  if (!config.audienceId) return false;

  const result = await resendFetch<{ id: string }>(
    config,
    `/audiences/${config.audienceId}/contacts`,
    {
      email: contact.email,
      ...(contact.firstName ? { first_name: contact.firstName } : {}),
      unsubscribed: false,
    }
  );

  if (!result.ok) {
    console.error("Resend audience sync failed:", result.error);
    return false;
  }
  return true;
}
