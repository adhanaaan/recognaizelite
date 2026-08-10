-- ReCOGnAIze Lite — `/lite-one` funnel lead + attempt schema
-- Run once in the Supabase SQL editor for the project.
-- RLS stays off; all reads/writes go through server API routes using the service-role key.
--
-- Why a dedicated table rather than `public.leads` (where this funnel first
-- landed): `leads` still carries `leads_clinic_email_unique (clinic, email_lower)`,
-- the last surviving email dedup in the schema. Every consumer table created
-- since dropped it on purpose — see the header of 003_hookikigai_leads.sql. On
-- `leads` a repeat submit raises 23505, save-lead.ts swallows it, and the row
-- stays frozen at the person's first-ever attempt. /lite-one actively invites
-- people to retake the test, so that would silently discard exactly the data
-- the funnel exists to collect.
--
-- Two departures from the sibling tables, both deliberate:
--
--   `email` is NULLABLE. A row is written when the visitor finishes the game
--   and reaches the form, before any contact details exist. `completed_at`
--   distinguishes a finished lead from an abandoned attempt, which is how
--   funnel drop-off gets measured.
--
--   `attempt_id` is UNIQUE. It is the key the contact submit updates against —
--   it is NOT email dedup. Someone retaking the test gets a fresh attempt_id
--   and therefore a fresh row, so score history accumulates.

create table if not exists public.liteone_leads (
  id            uuid primary key default gen_random_uuid(),
  attempt_id    uuid not null,     -- client-generated, links attempt → submit
  email         text,              -- NULL until the form is submitted
  email_lower   text generated always as (lower(email)) stored,
  whatsapp      text,
  age_range     text,              -- "18-25", "26-35", "36-45", "46-55", "56-65", "66+"
  gender        text,              -- "male", "female", "prefer_not_to_say"
  score         integer,           -- task2 score at game end
  percentile    numeric,           -- percentile from generated report
  severity      text,              -- "low" | "moderate" | "high"
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  referrer      text,
  user_agent    text,
  ip_region     text,
  created_at    timestamptz not null default now(),  -- when the game finished
  completed_at  timestamptz                          -- when contact details arrived
);

-- Update key for the contact submit. Not an email constraint.
create unique index if not exists liteone_leads_attempt_idx
  on public.liteone_leads (attempt_id);

create index if not exists liteone_leads_created_at_idx  on public.liteone_leads (created_at desc);
create index if not exists liteone_leads_email_lower_idx on public.liteone_leads (email_lower);

-- Drop-off queries hit this constantly: completed vs abandoned.
create index if not exists liteone_leads_completed_at_idx on public.liteone_leads (completed_at);
