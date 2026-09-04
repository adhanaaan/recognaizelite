-- /lite-event-template report CTA — the two trackers behind the new closing.
-- Run once in the Supabase SQL editor. Additive and idempotent, so re-running
-- is safe if you are unsure whether it took.
--
-- The template funnel's report is trialling a closing without a price card or
-- voucher page. In its place the reader gets an "I'm interested" button under
-- the three steps, and a "What happens next" card that ends on one tickbox:
-- "Send me brain health tips, and early access when we launch." Neither is a
-- purchase, so neither belongs on the lead row — they are what the reader did
-- *after* the lead was captured, and the question the booth team asks
-- afterwards is "who raised their hand?", not "who signed up?".
--
-- One row per run, keyed by the same client-generated `attempt_id` that
-- liteevent_leads carries, so a row here joins back to its lead:
--
--   select l.name, l.email, i.interested, i.tips_opt_in
--   from liteevent_report_interest i
--   join liteevent_leads l using (attempt_id)
--   where i.interested;
--
-- Not a foreign key on purpose. The lead row is written by /api/lite-attempt
-- at game end and completed by /api/save-lead; if either failed for a visitor
-- (offline booth wifi, chiefly) the interest they showed is still worth
-- keeping rather than being refused for want of a parent.
--
-- The row is written on the first interaction, not on page view, so its
-- presence already means "did something". Both flags default to false and each
-- has a timestamp beside it, which gives three readable states per flag:
-- false with a NULL timestamp is never touched, true is clicked / ticked, and
-- false with a timestamp is ticked and then unticked (the button is one-way,
-- so its timestamp only ever moves once).
--
-- `funnel` is the route the row came from. Every funnel writing here shares
-- the "liteevent" clinic, so this is how the template's trial is read apart
-- from anything that later adopts the same closing; `utm_campaign` separates
-- the occasions within it, as it does on liteevent_leads.

create table if not exists public.liteevent_report_interest (
  id             uuid primary key default gen_random_uuid(),
  attempt_id     uuid not null unique,      -- same id as liteevent_leads.attempt_id
  clinic         text not null default 'liteevent',
  funnel         text,                      -- route prefix, e.g. "/lite-event-template"
  utm_campaign   text,                      -- the occasion, as on liteevent_leads
  lang           text,                      -- "en" | "zh" | "ms" — the language they read it in

  interested     boolean not null default false,  -- tapped "I'm interested"
  interested_at  timestamptz,                     -- when; NULL until they do
  tips_opt_in    boolean not null default false,  -- ticked "Send me brain health tips…"
  tips_opt_in_at timestamptz,                     -- when it last changed; NULL = never touched

  user_agent     text,
  ip_region      text,
  created_at     timestamptz not null default now(),  -- first interaction
  updated_at     timestamptz not null default now()   -- latest one
);

comment on table public.liteevent_report_interest is
  'What a visitor did with the CTA at the foot of the /lite-event-template report, after their lead was captured. One row per run, joined to liteevent_leads on attempt_id.';
comment on column public.liteevent_report_interest.interested is
  'True once they tapped "I''m interested". One-way: the button confirms and stays confirmed.';
comment on column public.liteevent_report_interest.interested_at is
  'When they tapped it. NULL means they never did.';
comment on column public.liteevent_report_interest.tips_opt_in is
  'Current state of the "Send me brain health tips, and early access when we launch" tickbox.';
comment on column public.liteevent_report_interest.tips_opt_in_at is
  'When the tickbox last changed. NULL with tips_opt_in false means it was never touched.';
comment on column public.liteevent_report_interest.funnel is
  'Route the row was written from, e.g. "/lite-event-template". The clinic is shared, so this is what separates the trial from later adopters.';

create index if not exists liteevent_report_interest_created_at_idx
  on public.liteevent_report_interest (created_at desc);
create index if not exists liteevent_report_interest_campaign_idx
  on public.liteevent_report_interest (utm_campaign);

-- The two questions this table exists to answer, each a partial index so the
-- "no" rows cost nothing.
create index if not exists liteevent_report_interest_interested_idx
  on public.liteevent_report_interest (interested)
  where interested;
create index if not exists liteevent_report_interest_tips_idx
  on public.liteevent_report_interest (tips_opt_in)
  where tips_opt_in;
