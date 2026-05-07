-- ReCOGnAIze Lite — HealthTechX (`/demo`) lead collection schema
-- Run once in the Supabase SQL editor for the project.
-- RLS stays off; all reads/writes go through server API routes using the service-role key.
--
-- Audience is B2B (industry attendees), so this table captures role + organization
-- instead of the consumer demographics (age/gender) that the SJMC `leads` table holds.
-- No unique constraint on email — booth duplicates are allowed by design.

create table if not exists public.demo_leads (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null,
  email_lower         text generated always as (lower(email)) stored,
  role                text,        -- clinician/executive/investor/pharma/vendor/researcher/press/other
  organization        text,
  organization_type   text,        -- hospital/clinic/payer/pharma/startup/academic/government/other
  cognitive_interest  text,        -- free-text: visitor's interest in cognitive health
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

-- Idempotent: re-running this migration on an existing table will still
-- pick up newly added columns. `create table if not exists` above is a
-- no-op when the table already exists, so the alters below are required
-- to retrofit columns on prior deploys.
alter table public.demo_leads
  add column if not exists cognitive_interest text;

create index if not exists demo_leads_created_at_idx  on public.demo_leads (created_at desc);
create index if not exists demo_leads_email_lower_idx on public.demo_leads (email_lower);
create index if not exists demo_leads_role_idx        on public.demo_leads (role);
create index if not exists demo_leads_org_type_idx    on public.demo_leads (organization_type);
