-- ReCOGnAIze Lite — Brain Health Quiz columns on demo_leads
-- Run once in the Supabase SQL editor. Additive + idempotent — re-running
-- is a no-op once the columns exist.
--
-- Why: /demo now wedges the Brain Health Quiz (~20 questions, two axes,
-- citations from CAIDE, Lancet 2024, SCD, IMH WiSE) between the 60s Symbol
-- Matching game and the existing B2B capture page. Every healthtechx lead
-- carries the answer map plus the computed score so the leads dashboard
-- can slice the audience.
--
-- quiz_answers is JSONB rather than per-question columns so the schema
-- stays stable as the question bank evolves; the denormalised score
-- columns make common lead-dashboard filters (band, score range) cheap.

alter table public.demo_leads
  add column if not exists quiz_answers jsonb,
  add column if not exists brain_health_score integer,
  add column if not exists risk_score integer,
  add column if not exists symptom_score integer,
  add column if not exists band text,
  add column if not exists persona text;
