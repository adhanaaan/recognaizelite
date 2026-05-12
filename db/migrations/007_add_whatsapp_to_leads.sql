-- ReCOGnAIze Lite — Add WhatsApp follow-up channel to every lead table.
-- Run once in the Supabase SQL editor. Additive + idempotent — re-running
-- is a no-op once the columns exist.
--
-- The application stores values in a normalised "+digits" form (leading
-- "+" optional). Validation is enforced server-side in save-lead.ts.

alter table public.leads             add column if not exists whatsapp text;
alter table public.hookikigai_leads  add column if not exists whatsapp text;
alter table public.demo_leads        add column if not exists whatsapp text;
alter table public.tcmbrain_leads    add column if not exists whatsapp text;
