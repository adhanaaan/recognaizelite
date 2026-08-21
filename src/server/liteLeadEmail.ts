/**
 * Post-save delivery for lite-funnel leads: mails the visitor their result and
 * adds them to the campaign Audience.
 *
 * Server-only. Called from /api/save-lead after the row is safely written —
 * never before. Capturing the lead is the job that matters; this is the
 * follow-up, and every failure path here returns quietly rather than throwing,
 * so a Resend outage can't turn a captured lead into a failed submit.
 *
 * The whole thing is a no-op unless RESEND_API_KEY and RESEND_FROM are set, so
 * local dev and preview deploys collect leads without credentials.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { renderClinicianResultEmail } from "src/server/emails/clinicianResultEmail";
import { renderEventResultEmail } from "src/server/emails/eventResultEmail";
import { renderLiteResultEmail } from "src/server/emails/liteResultEmail";
import type { LiteEmailRenderer } from "src/server/emails/shared";
import { addContactToAudience, getResendConfig, sendEmail } from "src/server/resend";

/**
 * Clinics whose leads get a result email: the name each one signs it with, and
 * which template it uses. /lite-one is deliberately absent — it has been
 * running without email, and silently starting to mail its existing audience
 * is not a change to make as a side effect of another one.
 *
 * Adding a funnel here is all it takes to enable it, and because the brand and
 * template sit beside the key rather than in shared constants, doing so forces
 * a decision about both rather than inheriting someone else's.
 *
 * The three templates differ in what they are for. The consumer one explains
 * the result; the clinician one spends its length on the published validation;
 * the event one is a courtesy note to a guest at a fundraiser.
 */
const EMAIL_CLINICS: Record<string, { brand: string; render: LiteEmailRenderer }> = {
  liteworldalz: { brand: "Recog-Lite", render: renderLiteResultEmail },
  liteclinician: { brand: "Recog-Lite", render: renderClinicianResultEmail },
  litebcgolf: { brand: "ReCOGnAIze Lite", render: renderEventResultEmail },
};

export function emailEnabledForClinic(clinic: string): boolean {
  return clinic in EMAIL_CLINICS;
}

export type LiteLeadEmailParams = {
  supabase: SupabaseClient;
  /** Funnel key, used to resolve the brand the mail is signed with. */
  clinic: string;
  /** Table the lead row lives in, e.g. "liteworldalz_leads". */
  table: string;
  /** Row key. The same attempt id the lead was written under. */
  attemptId: string;
  email: string;
  name: string | null;
  percentile: number | null;
  severity: string | null;
  brainHealthScore: number | null;
  band: string | null;
  /** utm_campaign, tagged onto the send so Resend can slice by it. */
  campaign: string | null;
};

/**
 * Resend tag values are restricted to ASCII letters, digits, underscores and
 * dashes. A campaign name arrives from a query string, so it is coerced rather
 * than trusted — an invalid tag would reject the entire send.
 */
function safeTagValue(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 60);
  return cleaned.length > 0 ? cleaned : null;
}

export async function deliverLiteResultEmail(params: LiteLeadEmailParams): Promise<void> {
  const config = getResendConfig();
  if (!config) return; // Integration not configured — nothing to do.

  const funnel = EMAIL_CLINICS[params.clinic];
  if (!funnel) return; // Not a sending funnel; the caller normally screens this.

  const { supabase, table, attemptId, email } = params;

  // Idempotency guard. `email_sent_at` is the only thing preventing a resubmit
  // or a retry from mailing the same person twice, so a failure to read it
  // fails closed: no send. A loud log beats duplicate mail to a real inbox.
  const { data: existing, error: readError } = await supabase
    .from(table)
    .select("id, email_sent_at")
    .eq("attempt_id", attemptId)
    .maybeSingle();

  if (readError) {
    console.error(
      `Resend: cannot read send state on ${table} (if this mentions a missing column, that table's email-columns migration has not been run):`,
      readError.message
    );
    return;
  }
  if (!existing) {
    console.error(`Resend: no ${table} row for attempt ${attemptId}; skipping send.`);
    return;
  }
  if (existing.email_sent_at) return; // Already mailed this attempt.

  const { subject, html, text } = funnel.render({
    brand: funnel.brand,
    name: params.name,
    percentile: params.percentile,
    severity: params.severity,
    brainHealthScore: params.brainHealthScore,
    band: params.band,
    // Rendered by the clinician and event templates; the consumer one ignores
    // them.
    demoUrl: process.env.RECOGNAIZE_DEMO_URL ?? null,
    bookingUrl: process.env.RECOGNAIZE_CALENDLY_URL ?? null,
  });

  const campaignTag = safeTagValue(params.campaign);
  const sent = await sendEmail(config, {
    to: email,
    subject,
    html,
    text,
    tags: [
      { name: "funnel", value: safeTagValue(params.clinic) ?? "lite" },
      ...(campaignTag ? [{ name: "campaign", value: campaignTag }] : []),
    ],
  });

  // Contact sync is independent of the send: a bounced result email is no
  // reason to leave someone off the campaign list, and vice versa.
  const synced = await addContactToAudience(config, { email, firstName: params.name });

  if (!sent && !synced) return; // Nothing happened worth recording.

  const stamp = new Date().toISOString();
  const { error: stampError } = await supabase
    .from(table)
    .update({
      ...(sent ? { email_sent_at: stamp, resend_email_id: sent.id } : {}),
      ...(synced ? { audience_synced_at: stamp } : {}),
    })
    .eq("attempt_id", attemptId);

  // A failed stamp means the next resubmit would send again. Worth a log, not
  // worth failing the request the visitor is waiting on.
  if (stampError) {
    console.error(`Resend: sent but failed to stamp ${table}:`, stampError.message);
  }
}
