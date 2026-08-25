-- Corporate events — `/lite-event` lead + attempt schema.
-- Run once in the Supabase SQL editor before the first event. Additive and
-- idempotent, so re-running is safe if you are unsure whether it took.
--
-- Identical in shape to liteone_leads (010 + 011), liteworldalz_leads
-- (012 + 013), liteclinician_leads (014), litetwo_leads (015),
-- act4health_leads (016) and litebcgolf_leads (017). One normalizer in
-- leadAggregation.ts serves all of them, so the columns must stay in lockstep.
--
-- Why its own table rather than reusing litetwo_leads, which this funnel is
-- otherwise a copy of: event traffic arrives in a few hours from a captive
-- audience, which would distort every rate the admin dashboard reports for a
-- funnel that runs continuously. Kept apart, each is readable on its own.
--
-- Why one table for all events rather than one per event: an event funnel that
-- needs a migration and a deploy per booth is a funnel nobody uses on short
-- notice. `utm_campaign` separates the occasions after the fact — that is what
-- its index below is for — and the link is the only thing that changes.
--
-- Email columns are included from the start, as in 014. This funnel mails every
-- lead their result; see EMAIL_CLINICS in src/server/liteLeadEmail.ts.
--
-- The two departures inherited from 010, both still deliberate:
--
--   `email` is NULLABLE. A row is written when the visitor finishes the game
--   and reaches the form, before any contact details exist. `completed_at`
--   distinguishes a finished lead from an abandoned attempt, which is how
--   funnel drop-off gets measured — and at an event, where people are pulled
--   away mid-flow, that gap is the number worth watching.
--
--   `attempt_id` is UNIQUE. It is the key the contact submit updates against —
--   it is NOT email dedup. Someone retaking gets a fresh attempt_id and
--   therefore a fresh row, so a shared iPad at a booth records every visitor
--   rather than overwriting the first one.

create table if not exists public.liteevent_leads (
  id            uuid primary key default gen_random_uuid(),
  attempt_id    uuid not null,     -- client-generated, links attempt → submit
  name          text,
  email         text,              -- NULL until the form is submitted
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

  utm_source    text,
  utm_medium    text,
  utm_campaign  text,              -- the occasion, e.g. "sgtech-summit-2026"
  referrer      text,
  user_agent    text,
  ip_region     text,
  created_at    timestamptz not null default now(),  -- when the game finished
  completed_at  timestamptz,                         -- when contact details arrived

  -- Resend bookkeeping (mirrors 013). email_sent_at is the idempotency guard.
  email_sent_at      timestamptz,
  resend_email_id    text,
  audience_synced_at timestamptz
);

-- Update key for the contact submit. Not an email constraint.
create unique index if not exists liteevent_leads_attempt_idx
  on public.liteevent_leads (attempt_id);

create index if not exists liteevent_leads_created_at_idx  on public.liteevent_leads (created_at desc);
create index if not exists liteevent_leads_email_lower_idx on public.liteevent_leads (email_lower);
create index if not exists liteevent_leads_completed_at_idx on public.liteevent_leads (completed_at);
create index if not exists liteevent_leads_email_sent_idx on public.liteevent_leads (email_sent_at);

-- The one column that separates one event from another. Every occasion reuses
-- this table, so this index is how a single event's numbers get pulled out.
create index if not exists liteevent_leads_campaign_idx on public.liteevent_leads (utm_campaign);
