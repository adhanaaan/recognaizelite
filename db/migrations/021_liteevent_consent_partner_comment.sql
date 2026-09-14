-- consent_partner now carries two partners' consents, not one.
-- Run once in the Supabase SQL editor. Comment-only and idempotent, so
-- re-running is safe if you are unsure whether it took.
--
-- Migration 019 added the consent columns to liteevent_leads for /parkway and
-- described consent_partner as IHH Healthcare Singapore's consent, because
-- /parkway was the only funnel in this family that asked for one. /clinic-signup
-- now asks too — the Eisai newsletter sign-up on /clinic-signup/consent, taken
-- before the run rather than after the lead form — and writes the answer to the
-- same column.
--
-- Nothing about the column changes, and nothing needs to: the question it
-- records is the same one ("did this visitor consent to the partner on this
-- funnel?"), and which partner that is is already on the row, in utm_campaign.
-- Only the comment was too narrow to stay true, and a comment that names the
-- wrong partner is worse than none when a PDPA request is being answered from
-- this column.
--
-- Read it as three states, as before: true agreed, false read it and declined,
-- NULL never asked. /clinic-signup never writes false through the funnel — the
-- run does not start without the consent — so a false on one of its rows means
-- the browser lost the answer mid-run, not that the visitor refused.
--
--   select utm_campaign, consent_partner, consent_at, email
--   from public.liteevent_leads
--   where utm_campaign = 'clinic-signup' and consent_partner;

comment on column public.liteevent_leads.consent_partner is
  'Partner consent for the funnel the row came from, identified by utm_campaign: IHH Healthcare Singapore on /parkway/consent (given after the lead form, before the result is saved or mailed), Eisai (Singapore) Pte Ltd on /clinic-signup/consent (the EDM and CME sign-up, given before the run starts). NULL = never asked.';
