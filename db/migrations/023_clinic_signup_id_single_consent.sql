-- /clinic-signup-id now asks once, not twice. Comment-only.
-- Run once in the Supabase SQL editor. Idempotent, so re-running is safe if you
-- are unsure whether it took. Nothing about the schema changes.
--
-- Migration 022 described this funnel as asking two separate questions — a
-- required processing consent in consent_analytics and an optional marketing
-- consent in consent_marketing — because that is how it shipped. It now asks
-- the way /clinic-signup asks: one compulsory tickbox carrying the processing,
-- the transfer out of Indonesia and the marketing together, with Indonesia's
-- disclosures written into the sentence and the full Art. 21 notice linked from
-- inside it (/clinic-signup-id/privacy, both languages).
--
-- What that means when the table is read back:
--
--   consent_analytics   true on every /clinic-signup-id row. The run does not
--                       start without the tick, and the tick covers this.
--   consent_marketing   ALSO true on every /clinic-signup-id row, from the same
--                       tick. It is NOT the free choice it is on /parkway.
--
-- That last line is the one to be careful about. On /parkway consent_marketing
-- is an opt-in the visitor could decline, and on /clinic-signup-id rows written
-- before this change it was too — those rows carry a genuine yes or no. From
-- here it records a condition they accepted to take the assessment, the same
-- reading migration 021 gave /clinic-signup's rows.
--
-- consent_version is what tells the two apart, which is why it exists:
--
--   -- asked as two questions; consent_marketing is a real choice
--   select * from public.liteevent_leads
--   where consent_version = 'clinic-signup-id/2026-09-17';
--
--   -- asked as one; consent_marketing is a condition, always true
--   select * from public.liteevent_leads
--   where consent_version = 'clinic-signup-id/2026-09-17-2';
--
-- A campaign counting "who opted in to marketing" across this funnel must
-- therefore group by consent_version, or it will read a compulsory tick as
-- enthusiasm. Rows with consent_version NULL pre-date the column entirely.

comment on column public.liteevent_leads.consent_marketing is
  'Consent for Gray Matter Solutions to send email and newsletters. A free opt-in on /parkway; a condition of the assessment on /clinic-signup (migration 021) and, from consent_version "clinic-signup-id/2026-09-17-2" onward, on /clinic-signup-id too, whose earlier version asked it as a separate optional question. Group by consent_version before reading this as a choice. NULL = never asked.';

comment on column public.liteevent_leads.consent_analytics is
  'Required tickbox: the visitor''s assessment data may be collected and processed by Gray Matter Solutions. On /parkway that is campaign analytics; on /clinic-signup-id it is the processing and cross-border transfer consent required by UU No. 27 Tahun 2022, and is true on every row because the run will not start without it. NULL = never asked.';
