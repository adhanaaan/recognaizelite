-- ReCOGnAIze Lite — SJMC lead collection schema
-- Run once in the Supabase SQL editor for the project.
-- RLS stays off; all reads/writes go through server API routes using the service-role key.

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  email_lower   text generated always as (lower(email)) stored,
  clinic        text not null,
  age_range     text,              -- "18-25", "26-35", "36-45", "46-55", "56-65", "66+"
  gender        text,              -- "male", "female", "prefer_not_to_say"
  score         integer,           -- task2 score at submit time
  percentile    numeric,           -- percentile from generated report
  severity      text,              -- "low" | "mild" | "moderate" | "high"
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  referrer      text,
  user_agent    text,
  ip_region     text,
  health_goal   text,              -- "stay_sharp", "improve_focus", "prevent_decline", "longevity"
  takes_supplements text,          -- "yes_regularly", "occasionally", "no_but_interested", "no"
  created_at    timestamptz not null default now()
);

-- Natural dedup: one row per (clinic, email) case-insensitive.
create unique index if not exists leads_clinic_email_unique
  on public.leads (clinic, email_lower);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_clinic_idx     on public.leads (clinic);
