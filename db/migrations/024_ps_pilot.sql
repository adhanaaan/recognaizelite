-- /parkwayshenton — `ps_pilot` lead + attempt schema.
-- Run once in the Supabase SQL editor BEFORE deploying the code that writes to
-- it: /api/lite-attempt and /api/save-lead resolve clinic "pspilot" to this
-- table, and a missing table fails the game-end write and the lead write alike.
-- Additive and idempotent, so re-running is safe if you are unsure it took.
--
-- Why its own table, when /parkwayshenton was writing to liteevent_leads: its
-- quiz asks one question no other funnel does — "Which clinic are you from?" —
-- and this table has the column for the answer. It also keeps this partner's
-- rows apart from the corporate-event traffic, which is read as a whole.
--
-- Everything else is liteevent_leads (018 + 019 + 022) column for column, so
-- the one normalizer in leadAggregation.ts serves it too. The names are kept
-- for the same reason: consent_partner is IHH Healthcare Singapore's consent,
-- exactly as it is there, and a PDPA request about it is answered from the same
-- column on either table.
--
-- The report-interest taps (the "I'm interested" button and the tips opt-in)
-- still go to liteevent_report_interest (020), joined to this table on
-- attempt_id. Its `clinic` column reads "pspilot" on those rows.
--
-- `email` is NULLABLE and `attempt_id` is UNIQUE for the reasons given in 018:
-- a row opens before contact details exist, and attempt_id is the update key,
-- not email dedup.

create table if not exists public.ps_pilot (
  id            uuid primary key default gen_random_uuid(),
  attempt_id    uuid not null,     -- client-generated, links attempt → submit
  name          text,
  email         text,              -- NULL until the sign-up is submitted
  email_lower   text generated always as (lower(email)) stored,
  whatsapp      text,
  age_range     text,              -- "18-25", "26-35", "36-45", "46-55", "56-65", "66+"
  gender        text,              -- "male", "female", "prefer_not_to_say"
  score         integer,           -- task2 score at game end
  percentile    numeric,           -- percentile from generated report
  severity      text,              -- "low" | "moderate" | "high"

  -- Brain Health Quiz (mirrors 011).
  quiz_answers        jsonb,
  brain_health_score  integer,     -- 0-100
  risk_score          integer,     -- 0-68
  symptom_score       integer,     -- 0-32
  band                text,        -- "low" | "moderate" | "elevated" | "high"
  persona             text,        -- "neutral" | "highPerformer" | "perimenopausal" | "caregiver"

  -- The quiz's last question, "Which clinic are you from?". Not scored. Also
  -- present in quiz_answers under the key "clinic"; this is the same value as a
  -- column so it can be grouped on without unpacking JSON.
  clinic_location     text,        -- "republic_plaza" | "ang_mo_kio" | "mount_elizabeth" | "woodleigh" | "not_in_clinic"

  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  referrer      text,
  user_agent    text,
  ip_region     text,
  created_at    timestamptz not null default now(),  -- when the game finished
  completed_at  timestamptz,                         -- when the quiz result arrived

  -- Consents (mirrors 019 + 022).
  consent_analytics boolean,       -- Gray Matter Solutions: assessment data may be processed
  consent_marketing boolean,       -- Gray Matter Solutions: tips and updates
  consent_partner   boolean,       -- IHH Healthcare Singapore
  consent_at        timestamptz,   -- when they were given
  consent_version   text,          -- wording agreed to, when the funnel names one

  -- Resend bookkeeping (mirrors 013). email_sent_at is the idempotency guard.
  email_sent_at      timestamptz,
  resend_email_id    text,
  audience_synced_at timestamptz
);

comment on table public.ps_pilot is
  'Leads and attempts from /parkwayshenton (Parkway Shenton clinic pilot). Same shape as liteevent_leads plus clinic_location, the answer to the quiz''s "Which clinic are you from?".';
comment on column public.ps_pilot.clinic_location is
  'Answer to the last quiz question, "Which clinic are you from?": republic_plaza (Parkway Medical Clinic, Republic Plaza), ang_mo_kio (Parkway Family Medicine Clinic, Ang Mo Kio), mount_elizabeth (Parkway Executive Health Screeners, Mount Elizabeth Hospital), woodleigh (Parkway MediCentre @ The Woodleigh Mall) or not_in_clinic. NULL = the visitor did not reach that question. Not scored.';
comment on column public.ps_pilot.consent_partner is
  'IHH Healthcare Singapore PDPA consent, ticked on the /parkwayshenton landing page. NULL = never asked.';

-- Update key for the completion write. Not an email constraint.
create unique index if not exists ps_pilot_attempt_idx
  on public.ps_pilot (attempt_id);

create index if not exists ps_pilot_created_at_idx   on public.ps_pilot (created_at desc);
create index if not exists ps_pilot_email_lower_idx  on public.ps_pilot (email_lower);
create index if not exists ps_pilot_completed_at_idx on public.ps_pilot (completed_at);
create index if not exists ps_pilot_email_sent_idx   on public.ps_pilot (email_sent_at);
create index if not exists ps_pilot_campaign_idx     on public.ps_pilot (utm_campaign);
create index if not exists ps_pilot_clinic_location_idx
  on public.ps_pilot (clinic_location)
  where clinic_location is not null;
create index if not exists ps_pilot_consent_partner_idx
  on public.ps_pilot (consent_partner)
  where consent_partner is not null;
