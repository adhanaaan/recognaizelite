-- Resend delivery bookkeeping on liteworldalz_leads.
-- Additive + idempotent. Run once in the Supabase SQL editor.
--
-- /lite-worldalzmonth emails each lead their result on submit and adds them to
-- a Resend Audience for the campaign broadcasts. These columns record what
-- actually happened, for two reasons:
--
--   Idempotency. `email_sent_at` is checked before sending, so a resubmit —
--   or a retry after a partial failure — never mails the same person twice.
--   The send itself is not transactional with the row write, so this is the
--   only thing standing between a refresh and a duplicate email.
--
--   Coverage. A lead with contact details but a null `email_sent_at` means the
--   send failed or was skipped (missing config, hard bounce, Resend down).
--   Without the column those are invisible; with it they are one query.
--
-- All three are nullable and never block the lead write — capturing the lead
-- matters more than mailing it.

alter table public.liteworldalz_leads
  add column if not exists email_sent_at      timestamptz,
  add column if not exists resend_email_id    text,
  add column if not exists audience_synced_at timestamptz;

-- "Who did we fail to email?" — the coverage query above.
create index if not exists liteworldalz_leads_email_sent_idx
  on public.liteworldalz_leads (email_sent_at);
