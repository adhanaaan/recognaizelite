-- World Alzheimer's Month — `/lite-worldalzmonth` funnel lead + attempt schema
-- Run once in the Supabase SQL editor for the project.
-- RLS stays off; all reads/writes go through server API routes using the service-role key.
--
-- This is `liteone_leads` (010) with 011's Brain Health Quiz columns folded in,
-- under a new name. The funnel is a copy of /lite-one pointed at an email
-- audience, so the row shape is identical on purpose — leadAggregation.ts
-- normalizes both through the same function.
--
-- Why its own table rather than a `variant` column on `liteone_leads`:
-- every figure the admin dashboard reports (total, today, avgScore, and the
-- withContact drop-off gap) is aggregated per clinic. Sharing a table would
-- blend campaign traffic into the /lite-one baseline and make both unreadable.
-- Individual email sends are separated *within* this table by utm_campaign.
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

create table if not exists public.liteworldalz_leads (
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

  -- Brain Health Quiz (mirrors 011 on liteone_leads).
  quiz_answers        jsonb,
  brain_health_score  integer,     -- 0-100
  risk_score          integer,     -- 0-68
  symptom_score       integer,     -- 0-32
  band                text,        -- "low" | "moderate" | "elevated" | "high"
  persona             text,        -- "neutral" | "highPerformer" | "perimenopausal" | "caregiver"

  utm_source    text,
  utm_medium    text,
  utm_campaign  text,              -- the individual email send
  referrer      text,
  user_agent    text,
  ip_region     text,
  created_at    timestamptz not null default now(),  -- when the game finished
  completed_at  timestamptz                          -- when contact details arrived
);

-- Update key for the contact submit. Not an email constraint.
create unique index if not exists liteworldalz_leads_attempt_idx
  on public.liteworldalz_leads (attempt_id);

create index if not exists liteworldalz_leads_created_at_idx  on public.liteworldalz_leads (created_at desc);
create index if not exists liteworldalz_leads_email_lower_idx on public.liteworldalz_leads (email_lower);

-- Drop-off queries hit this constantly: completed vs abandoned.
create index if not exists liteworldalz_leads_completed_at_idx on public.liteworldalz_leads (completed_at);

-- Campaign breakdown is the whole point of this funnel.
create index if not exists liteworldalz_leads_campaign_idx on public.liteworldalz_leads (utm_campaign);
