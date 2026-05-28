-- ReCOGnAIze Lite — Let SJMC funnels accept WhatsApp-only leads.
-- Run once in the Supabase SQL editor. Idempotent — re-running is a no-op.
--
-- Why: the SJMC Banting Community Day audience skews senior; many can't
-- recall an email on the spot. The API (src/pages/api/save-lead.ts) now
-- accepts "email OR WhatsApp" for the sjmc + sjmcmandarin clinics and
-- still requires email for every other clinic.
--
-- Dedup: the existing unique index on (clinic, email_lower) is unchanged.
-- email_lower is `generated always as (lower(email)) stored`, so
-- WhatsApp-only rows store NULL there and PostgreSQL treats those NULLs
-- as distinct — multiple WhatsApp-only submissions can coexist without
-- a constraint violation, while emailed submissions still dedup per
-- clinic exactly as before.

alter table public.leads
  alter column email drop not null;
