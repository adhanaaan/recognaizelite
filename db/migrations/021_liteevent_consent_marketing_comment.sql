-- consent_marketing is compulsory on /clinic-signup, optional everywhere else.
-- Run once in the Supabase SQL editor. Comment-only and idempotent, so
-- re-running is safe if you are unsure whether it took.
--
-- Migration 019 added the consent columns to liteevent_leads for /parkway and
-- described consent_marketing as an optional tickbox ("occasional brain health
-- tips and updates"), because on /parkway that is exactly what it is.
--
-- /clinic-signup asks the same question of clinicians and writes the same
-- column, but there the tickbox is required: the lead form refuses to submit
-- without it, so every row that funnel writes carries true. That difference
-- matters when the column is read back — "who opted in?" on /parkway's rows is
-- a choice the visitor made, and on /clinic-signup's rows it is the condition
-- they accepted — so the comment now says which is which. utm_campaign is what
-- tells the two apart.
--
-- Nothing about the column changes, and no code depends on this migration.
-- Read it as three states, as before: true agreed, false read it and declined,
-- NULL never asked.
--
--   select utm_campaign, consent_marketing, consent_at, name, email
--   from public.liteevent_leads
--   where utm_campaign = 'clinic-signup';

comment on column public.liteevent_leads.consent_marketing is
  'Consent for Gray Matter Solutions to send email and newsletters. Optional on /parkway ("occasional brain health tips and updates"); required on /clinic-signup, whose lead form will not submit without it, so its rows are always true. Which funnel a row came from is in utm_campaign. NULL = never asked.';
