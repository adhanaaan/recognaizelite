-- ReCOGnAIze Lite — Hookikigai consumer funnel split-out
-- Run once in the Supabase SQL editor. Apply AFTER 001_sjmc_leads.sql.
-- RLS stays off; all reads/writes go through server API routes using the service-role key.
--
-- Hookikigai rows previously lived in the shared `leads` table (clinic = 'hookikigai').
-- This migration creates a dedicated table and copies legacy rows over so they remain
-- visible to the admin dashboard while live writes start landing in the new table.
-- Originals are NOT deleted from `leads` — they stay as a backup.
--
-- No unique constraint on email — duplicates allowed (matches the new policy).

create table if not exists public.hookikigai_leads (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  email_lower   text generated always as (lower(email)) stored,
  age_range     text,              -- "18-25", "26-35", "36-45", "46-55", "56-65", "66+"
  gender        text,              -- "male", "female", "prefer_not_to_say"
  score         integer,           -- task2 score at submit time
  percentile    numeric,           -- percentile from generated report
  severity      text,              -- "low" | "moderate" | "high"
  health_goal   text,              -- "stay_sharp", "improve_focus", "prevent_decline", "longevity"
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  referrer      text,
  user_agent    text,
  ip_region     text,
  created_at    timestamptz not null default now()
);

create index if not exists hookikigai_leads_created_at_idx  on public.hookikigai_leads (created_at desc);
create index if not exists hookikigai_leads_email_lower_idx on public.hookikigai_leads (email_lower);

-- One-time backfill copy. Safe to re-run because of `on conflict do nothing`
-- (the only conflict source is the primary key, which is freshly generated each time —
-- so re-running this WILL create duplicate rows. Run the insert only once.)
insert into public.hookikigai_leads
  (email, age_range, gender, score, percentile, severity, health_goal,
   utm_source, utm_medium, utm_campaign, referrer, user_agent, ip_region, created_at)
select
  email, age_range, gender, score, percentile, severity, health_goal,
  utm_source, utm_medium, utm_campaign, referrer, user_agent, ip_region, created_at
from public.leads
where clinic = 'hookikigai'
  and not exists (
    -- Crude guard: skip the insert entirely if hookikigai_leads already has rows.
    -- Lets the migration be re-applied without duplicating the backfill.
    select 1 from public.hookikigai_leads limit 1
  );
