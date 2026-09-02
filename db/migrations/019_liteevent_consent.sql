-- Consent columns for the event funnels' leads table.
-- Run once in the Supabase SQL editor. Additive and idempotent, so re-running
-- is safe if you are unsure whether it took.
--
-- Added for /parkway, which is the first funnel in this family to ask. It asks
-- in two places: two tickboxes under the lead form's email field (campaign
-- analytics by Gray Matter Solutions, which is required there, and the
-- newsletter opt-in, which is not), and IHH Healthcare Singapore's own consent
-- on /parkway/consent, the screen that stands between the form and the report.
-- Parkway Shenton is part of IHH, and under the PDPA that consent is theirs to
-- hold, so it is recorded rather than merely displayed.
--
-- /parkway writes to liteevent_leads, which it shares with /lite-event and
-- /lite-event-template (see PARKWAY in src/utils/liteOne.ts for why). Those two
-- have no consent screen and post none of these fields; their rows keep NULL,
-- which is the honest value for a question never put to the visitor. Read the
-- columns as three states, not two: true agreed, false read it and declined,
-- NULL never asked.
--
-- Nothing here is required by the API. /api/save-lead already retries without
-- these columns if the schema cache says they are absent, so a deploy that
-- reaches an environment where this migration has not run still takes the
-- lead — it just records no consent. Run it before the funnel goes out.

alter table public.liteevent_leads
  add column if not exists consent_analytics boolean,   -- campaign analytics, Gray Matter
  add column if not exists consent_marketing boolean,   -- brain health tips + updates
  add column if not exists consent_partner   boolean,   -- IHH Healthcare Singapore
  add column if not exists consent_at        timestamptz;  -- when they were given

comment on column public.liteevent_leads.consent_analytics is
  'Required tickbox on the lead form: assessment data may be used for campaign analytics by Gray Matter Solutions. NULL = never asked.';
comment on column public.liteevent_leads.consent_marketing is
  'Optional tickbox on the lead form: occasional brain health tips and updates. NULL = never asked.';
comment on column public.liteevent_leads.consent_partner is
  'IHH Healthcare Singapore PDPA consent, given on /parkway/consent before the result is saved or mailed. NULL = never asked.';
comment on column public.liteevent_leads.consent_at is
  'When the consents on this row were given. Stamped only when at least one of them was actually asked for.';

-- The column a PDPA request is answered from, so it is worth an index of its
-- own: "who agreed to IHH marketing, and when".
create index if not exists liteevent_leads_consent_partner_idx
  on public.liteevent_leads (consent_partner)
  where consent_partner is not null;
