-- /act4health funnel — lead + attempt schema
-- Run once in the Supabase SQL editor for the project.
-- RLS stays off; all reads/writes go through server API routes using the service-role key.
--
-- The fifth lite table, and identical in shape to liteone_leads (010 + 011),
-- liteworldalz_leads (012 + 013), liteclinician_leads (014) and litetwo_leads
-- (015). One normalizer in leadAggregation.ts serves all of them, so the
-- columns must stay in lockstep.
--
-- Why its own table: /act4health is /lite-two's flow co-branded for ACT4Health,
-- the University of Malaya geriatric clinic in Petaling Jaya, served on the
-- partner's own domain. Every figure the admin dashboard reports is aggregated
-- per clinic — partner traffic gets its own table so its conversion behaviour
-- never blends into the /lite-two experiment or the /lite-one baseline.
--
-- The email columns (013's addition to liteworldalz_leads) are included from
-- the start, mirroring 015. They stay unused until this funnel is added to
-- EMAIL_CLINICS in src/server/liteLeadEmail.ts — like /lite-two, this funnel
-- collects the address without sending a result email.
--
-- The two departures inherited from 010, both still deliberate:
--
--   `email` is NULLABLE. A row is written when the visitor finishes the game
--   and reaches the form, before any contact details exist. `completed_at`
--   distinguishes a finished lead from an abandoned attempt, which is how
--   funnel drop-off gets measured.
--
--   `attempt_id` is UNIQUE. It is the key the contact submit updates against —
--   it is NOT email dedup. Someone retaking the test gets a fresh attempt_id
--   and therefore a fresh row, so score history accumulates.

create table if not exists public.act4health_leads (
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
  utm_campaign  text,
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
create unique index if not exists act4health_leads_attempt_idx
  on public.act4health_leads (attempt_id);

create index if not exists act4health_leads_created_at_idx  on public.act4health_leads (created_at desc);
create index if not exists act4health_leads_email_lower_idx on public.act4health_leads (email_lower);

-- Drop-off queries hit this constantly: completed vs abandoned.
create index if not exists act4health_leads_completed_at_idx on public.act4health_leads (completed_at);

-- "Who did we fail to email?"
create index if not exists act4health_leads_email_sent_idx on public.act4health_leads (email_sent_at);

create index if not exists act4health_leads_campaign_idx on public.act4health_leads (utm_campaign);
