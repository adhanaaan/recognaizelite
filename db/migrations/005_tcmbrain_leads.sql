-- ReCOGnAIze Lite — TCM Brain (`/tcmbrain`) lead collection schema
-- Run once in the Supabase SQL editor for the project.
-- RLS stays off; all reads/writes go through server API routes using the service-role key.
--
-- Audience is B2C consumers/patients via a TCM partner. Captures the standard
-- consumer demographics (age, gender) plus two TCM-specific indices the partner
-- requested: Dampness and Blood Stasis, each scored 1-10.
-- No unique constraint on email — duplicates allowed by design.

create table if not exists public.tcmbrain_leads (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null,
  email_lower         text generated always as (lower(email)) stored,
  age_range           text,        -- "18-25", "26-35", "36-45", "46-55", "56-65", "66+"
  gender              text,        -- "male", "female", "prefer_not_to_say"
  dampness_index      integer,     -- 1-10, TCM index (湿气)
  blood_stasis_index  integer,     -- 1-10, TCM index (血瘀)
  score               integer,     -- task2 score at submit time
  percentile          numeric,     -- percentile from generated report
  severity            text,        -- "low" | "moderate" | "high"
  utm_source          text,
  utm_medium          text,
  utm_campaign        text,
  referrer            text,
  user_agent          text,
  ip_region           text,
  created_at          timestamptz not null default now()
);

-- Range guard for the two indices (no-op if values are validated server-side too).
alter table public.tcmbrain_leads
  drop constraint if exists tcmbrain_leads_dampness_range;
alter table public.tcmbrain_leads
  add constraint tcmbrain_leads_dampness_range
  check (dampness_index is null or (dampness_index between 1 and 10));

alter table public.tcmbrain_leads
  drop constraint if exists tcmbrain_leads_blood_stasis_range;
alter table public.tcmbrain_leads
  add constraint tcmbrain_leads_blood_stasis_range
  check (blood_stasis_index is null or (blood_stasis_index between 1 and 10));

create index if not exists tcmbrain_leads_created_at_idx  on public.tcmbrain_leads (created_at desc);
create index if not exists tcmbrain_leads_email_lower_idx on public.tcmbrain_leads (email_lower);
