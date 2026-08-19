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
- `RECOGNAIZE_DEMO_URL`: where the clinician email's "See the full assessment" button points. Omitted from the email when unset.

## Resend (result emails + campaign audience)

`/lite-worldalzmonth` and `/lite-clinician` mail each lead their result on
submit and add them to a Resend Audience for campaign broadcasts. Both happen
server-side in `/api/save-lead`, after the lead row is written.

The two use different templates, chosen per funnel in `EMAIL_CLINICS`:

- **consumer** (`liteResultEmail.ts`) — explains the result. Used by `liteworldalz`.
- **clinician** (`clinicianResultEmail.ts`) — states the result briefly, then the
  peer-reviewed validation (*Alzheimer's & Dementia*, 2026, doi:10.1002/alz.70992)
  and a single demo CTA. Used by `liteclinician`. Every claim it makes lives in
  the `STUDY` constant at the top of that file, so the figures can be reviewed as
  one block.

The integration is **off unless configured**. With `RESEND_API_KEY` or
`RESEND_FROM` missing, leads are still captured and nothing is sent — so local
dev and preview deploys need no credentials.

Setup:

1. Verify your sending domain in Resend (Domains → Add Domain, then the DNS records).
2. Create an Audience if you want the campaign list; copy its id.
3. Run the sending funnel's email-columns migration in the Supabase SQL editor:
   `013_liteworldalz_email.sql` for `liteworldalz`; `liteclinician` already has
   the columns from `014`. Sending **fails closed** without them — the
   idempotency guard reads `email_sent_at`, and if that column is missing
   nothing is sent (a duplicate email to a real inbox is worse than a missing
   one). The function log says so.
4. Set the variables in Vercel:

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `RESEND_API_KEY` | yes | `re_...` from Resend → API Keys. Sending permission is enough. |
   | `RESEND_FROM` | yes | e.g. `Recog-Lite <results@yourdomain.com>`. Domain must be verified. |
   | `RESEND_AUDIENCE_ID` | no | Without it, emails still send; contacts aren't synced. |
   | `RESEND_REPLY_TO` | no | Where replies and bounces land. |

Notes:

- The result email carries the numbers **inline**. The report page reads from
  `sessionStorage`, so a link opened on another device — the normal case for
  email — would show the empty state rather than their result.
- `/lite-one` is deliberately excluded, so its existing audience isn't mailed
  as a side effect of another change. See `EMAIL_CLINICS` in
  `src/server/liteLeadEmail.ts`, which carries each funnel's brand and template
  next to its key.
- Names are greeted differently per template. The clinician one keeps a title
  ("Hi Dr Tan Wei Ming,") because picking the personal part of a titled name is
  not reliable when family name can come first; the consumer one uses the first
  name.
- Coverage query — leads that were captured but never mailed:
  `select count(*) from liteworldalz_leads where completed_at is not null and email_sent_at is null;`

## Lite funnels

`/lite-one` and its copies share one game, quiz, report and set of components,
and differ only in routes, leads table, brand and campaign. Two registries hold
that difference:

- `LITE_VARIANTS` (`src/utils/liteOne.ts`) — client side: routes, storage
  namespace, default campaign, `hookClinic`.
- `LITE_TABLES` (`src/server/liteFunnels.ts`) — server side: clinic → Supabase
  table. `/api/lite-attempt`, `/api/save-lead` and `leadAggregation` all resolve
  through it.

| Funnel | Clinic | Table | Migration |
| --- | --- | --- | --- |
| `/lite-one` | `liteone` | `liteone_leads` | 010, 011 |
| `/lite-worldalzmonth` | `liteworldalz` | `liteworldalz_leads` | 012, 013 |
| `/lite-clinician` | `liteclinician` | `liteclinician_leads` | 014 |
| `/lite-two` | `litetwo` | `litetwo_leads` | 015 |

`/lite-clinician` has eight pages, not nine: it carries no voucher page and no
commerce CTA, so `report-full` does not exist for it. The clinician next step is
still undecided; it lands at the foot of that funnel's `report.tsx`.

`/lite-two` is `/lite-one`'s flow with the report swapped for the v2
scroll-snapped design, personalised per the RevitalAIze v2 comps: the copy
splits by audience (optimizers vs seniors, cut at quiz age 40) and by how the
speed score came out (severity High vs the rest). The four copy sets live in
`src/data/liteTwoReportContent.ts`; `?persona=` and `?band=` on
`/lite-two/report` force a variant for design review.

Adding one means: a migration, an entry in each registry, the `hookClinic` value
in `LITE_HOOK_CLINICS` (`src/utils/assessment.ts`), the clinic allowlists in
`/api/save-lead` + `/api/generate-report` + `LONG_SHORT_CLINICS`, `KNOWN_CLINICS`,
the admin filter, the partner share theme, and the funnel's pages.

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
