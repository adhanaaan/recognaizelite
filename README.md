# Recognaize v2

Frontend for the Recognaize demo app, built with Next.js 13 and React 18.

## Getting started

1. Install dependencies:
   `npm install`
2. (Optional) Create `.env.local`:
   - `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
   - `NEXT_PUBLIC_LINK_VERSION=true`
3. Run the dev server:
   `npm run dev`

Open `http://localhost:3000`.

## Environment variables

Client:

- `NEXT_PUBLIC_API_URL`: Base API URL (defaults to `http://localhost:8000/api/v1`).
- `NEXT_PUBLIC_LINK_VERSION`: Set to `true` to enable link version behavior (skips auth token injection).

Server (API routes only — never exposed to the browser):

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`: lead storage. Required for any funnel that captures leads.
- `ADMIN_PASSWORD` / `ADMIN_COOKIE_SECRET`: the `/admin` dashboard.
- `RESEND_API_KEY`, `RESEND_FROM`: result emails — see below.
- `RESEND_AUDIENCE_ID`, `RESEND_REPLY_TO`: optional, see below.

## Resend (result emails + campaign audience)

`/lite-worldalzmonth` mails each lead their result on submit and adds them to a
Resend Audience for campaign broadcasts. Both happen server-side in
`/api/save-lead`, after the lead row is written.

The integration is **off unless configured**. With `RESEND_API_KEY` or
`RESEND_FROM` missing, leads are still captured and nothing is sent — so local
dev and preview deploys need no credentials.

Setup:

1. Verify your sending domain in Resend (Domains → Add Domain, then the DNS records).
2. Create an Audience if you want the campaign list; copy its id.
3. Run `db/migrations/013_liteworldalz_email.sql` in the Supabase SQL editor.
   Sending **fails closed** without it — the idempotency guard reads
   `email_sent_at`, and if that column is missing nothing is sent (a duplicate
   email to a real inbox is worse than a missing one). The function log says so.
4. Set the variables in Vercel:

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `RESEND_API_KEY` | yes | `re_...` from Resend → API Keys. Sending permission is enough. |
   | `RESEND_FROM` | yes | e.g. `BrainScan Testing <results@yourdomain.com>`. Domain must be verified. |
   | `RESEND_AUDIENCE_ID` | no | Without it, emails still send; contacts aren't synced. |
   | `RESEND_REPLY_TO` | no | Where replies and bounces land. |

Notes:

- The result email carries the numbers **inline**. The report page reads from
  `sessionStorage`, so a link opened on another device — the normal case for
  email — would show the empty state rather than their result.
- Only `liteworldalz` sends. `/lite-one` is deliberately excluded so its
  existing audience isn't mailed as a side effect; see `EMAIL_ENABLED_CLINICS`
  in `src/server/liteLeadEmail.ts`.
- Coverage query — leads that were captured but never mailed:
  `select count(*) from liteworldalz_leads where completed_at is not null and email_sent_at is null;`

## Scripts

- `npm run dev`: Start Next.js dev server.
- `npm run build`: Production build.
- `npm run start`: Start production server.
- `npm run export`: Static export.
- `npm run lint`: Run Next.js lint.
- `npm run type-check`: Run TypeScript checks.
- `npm run extract-translations`: Convert a CSV file into `src/locales/*.json` (prompts for file path).
- `npm run gen-images-list`: Regenerate `src/constants/IMAGES.json` from `public/images`.

## Project structure

- `src/api`: Axios client and API wrappers.
- `src/components`: App UI components.
- `src/constants`: App constants and generated assets (e.g. `IMAGES.json`).
- `src/locales`: Translation JSON bundles.
- `public/images`: Image assets used by the app.
- `scripts`: Utility scripts for translations and image lists.
