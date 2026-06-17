-- ReCOGnAIze Lite — Per-event tagging for demo_leads.
-- Run once in the Supabase SQL editor. Additive + idempotent — re-running
-- is a no-op once the column exists.
--
-- Why: /demo now has per-event variants (e.g. /demo-pantai for the Pantai
-- Hospital Kuala Lumpur event day). All variants funnel into the single
-- public.demo_leads table; this column carries the event ID so post-event
-- exports are a single `where demo_source = 'pantai-kl'` filter.
--
-- Values follow the same vocabulary as the API ALLOWED_CLINICS / DEMO_CLINICS
-- sets in src/pages/api/save-lead.ts:
--   "healthtechx" — generic /demo entry, the historical default
--   "pantai-kl"   — /demo-pantai event variant
-- Existing rows pre-dating this migration are NULL.

alter table public.demo_leads
  add column if not exists demo_source text;

create index if not exists demo_leads_demo_source_idx
  on public.demo_leads (demo_source);
