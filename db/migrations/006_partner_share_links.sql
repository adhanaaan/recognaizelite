-- ReCOGnAIze Lite — Partner share-link auth
-- Run once in the Supabase SQL editor for the project.
-- RLS stays off; all reads/writes go through server API routes using the
-- service-role key. Tokens-in-URL act as the bearer credential for the
-- partner-facing /share/[clinic]/[token] page.

create table if not exists public.partner_share_links (
  id                uuid primary key default gen_random_uuid(),
  clinic            text not null,           -- 'hookikigai' | 'sjmc' | 'healthtechx' | 'tcmbrain'
  token             text not null,           -- 22-char base64url, ~128 bits of entropy
  label             text,                    -- admin's note, e.g. "Shantal — Ikigai"
  created_at        timestamptz not null default now(),
  last_accessed_at  timestamptz,
  revoked_at        timestamptz
);

-- Token lookup must be fast and unique.
create unique index if not exists partner_share_links_token_idx
  on public.partner_share_links (token);

-- Admin UI filters/groups by clinic.
create index if not exists partner_share_links_clinic_idx
  on public.partner_share_links (clinic);
