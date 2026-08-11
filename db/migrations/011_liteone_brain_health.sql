-- Lite-One Brain Health Quiz columns on liteone_leads.
-- Additive + idempotent. Mirrors the pattern from 009_demo_brain_health.sql.
--
-- /lite-one now wedges the Brain Health Quiz between the 60s game and
-- the lead form. Every lite-one lead carries the answer map plus the
-- computed score so the leads dashboard can slice the audience by band,
-- risk factors, and persona.

alter table public.liteone_leads
  add column if not exists name            text,
  add column if not exists quiz_answers    jsonb,
  add column if not exists brain_health_score integer,
  add column if not exists risk_score      integer,
  add column if not exists symptom_score   integer,
  add column if not exists band            text,
  add column if not exists persona         text;
