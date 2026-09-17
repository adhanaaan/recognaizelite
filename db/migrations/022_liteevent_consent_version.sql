-- Records WHICH consent wording a row agreed to, for /clinic-signup-id.
-- Run once in the Supabase SQL editor. Additive and idempotent, so re-running
-- is safe if you are unsure whether it took.
--
-- Migration 019 added the consent booleans. A boolean proves that a box was
-- ticked; it does not prove what the box said. Indonesia's UU No. 27 Tahun 2022
-- (UU PDP) puts the burden of proving a valid consent on the controller
-- (Pasal 20), and a consent is only valid for the purposes it actually stated
-- (Pasal 21, Pasal 22), so a row from /clinic-signup-id carries the version
-- string of the wording it answered:
--
--   clinic-signup-id/2026-09-17
--
-- The string lives beside the copy it names, in
-- src/data/clinicSignupIdConsentCopy.ts, and is bumped whenever any clause
-- changes in substance. Rows written before a change keep the old string, which
-- is the point: the old wording is still recoverable from git by that name.
--
-- Nothing here is required by the API. /api/save-lead drops a column the
-- deployed table is missing and writes the rest, so a deploy that reaches an
-- environment where this migration has not run still takes the lead — it just
-- records no version. Run it before the funnel goes out.

alter table public.liteevent_leads
  add column if not exists consent_version text;  -- which wording was agreed to

comment on column public.liteevent_leads.consent_version is
  'The version string of the consent wording this row agreed to, e.g. "clinic-signup-id/2026-09-17". Written by funnels that name one; NULL on funnels that do not (every funnel but /clinic-signup-id today). The wording itself is in the matching src/data/*ConsentCopy.ts at that version.';

-- ---------------------------------------------------------------------------
-- How /clinic-signup-id uses the columns 019 added
-- ---------------------------------------------------------------------------
-- Its landing page asks two separate questions, because UU PDP Pasal 22 ayat (2)
-- requires a request covering more than one purpose to state each purpose
-- separately, and Pasal 22 ayat (3) voids a consent that does not:
--
--   consent_analytics  the REQUIRED one. Collecting and processing the name,
--                      email, quiz answers and cognitive result (health data,
--                      Pasal 4 ayat (2)) to run the assessment and send the
--                      result, and transferring it out of Indonesia (Pasal 56).
--                      The run will not start without it, so its rows are
--                      always true.
--
--   consent_marketing  the OPTIONAL one. Newsletters, brain health mail and
--                      event invitations. True or false, both meaningful: the
--                      visitor was asked and answered.
--
-- That is a different shape from the two funnels already writing this table:
-- on /parkway consent_analytics is the campaign-analytics tickbox, and on
-- /clinic-signup consent_marketing is compulsory (migration 021). utm_campaign
-- is what tells them apart.
--
--   select utm_campaign, consent_analytics, consent_marketing, consent_version,
--          consent_at, name, email
--   from public.liteevent_leads
--   where utm_campaign = 'clinic-signup-id';
--
-- As on /clinic-signup, the row is written on the landing page before the game
-- and completed afterwards, which makes `score` the completion marker:
--
--   -- started and walked away (still contactable, still consented)
--   select * from public.liteevent_leads
--   where utm_campaign = 'clinic-signup-id' and score is null;
--
-- The column a Pasal 5-13 request is answered from is worth an index of its
-- own: "who agreed to marketing, and when".
create index if not exists liteevent_leads_consent_marketing_idx
  on public.liteevent_leads (consent_marketing)
  where consent_marketing is not null;

-- ---------------------------------------------------------------------------
-- One more code in an existing column
-- ---------------------------------------------------------------------------
-- liteevent_report_interest.lang (migration 020) is documented in that file as
-- "en" | "zh" | "ms". /clinic-signup-id adds "id" for Bahasa Indonesia. The
-- column is already text, so nothing about it changes -- this only records the
-- new value where the table is read.

comment on column public.liteevent_report_interest.lang is
  'The language the report was read in, as the funnel''s own picker codes it: "en", "zh" or "ms" from the /lite-event family, "id" (Bahasa Indonesia) from /clinic-signup-id. NULL when the funnel did not say.';
