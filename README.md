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
- `RECOGNAIZE_CALENDLY_URL`: booking link. Becomes the clinician email's primary button. Omitted when unset.
- `RECOGNAIZE_DEMO_URL`: the full-assessment link. Primary button when there is no booking link, a secondary text link when there is. Omitted when unset.

## Resend (result emails + campaign audience)

`/lite-worldalzmonth`, `/lite-clinician` and `/lite-bcgolf` mail each lead
their result on submit and add them to a Resend Audience. All of it happens
server-side in `/api/save-lead`, after the lead row is written.

Each uses a different template, chosen per funnel in `EMAIL_CLINICS`:

- **consumer** (`liteResultEmail.ts`) — explains the result. Used by `liteworldalz`.
- **event** (`eventResultEmail.ts`) — a courtesy note to a guest at a
  fundraiser: the result stated once and large, one gold rule, one action. Used
  by `litebcgolf`.
- **clinician** (`clinicianResultEmail.ts`) — reads as a short report: the
  percentile plotted against its reference range, the validation figures, both
  citations (`alz.70992` and `jpad.2024.89`), then one action. Used by
  `liteclinician`. Every claim lives in the `STUDY` constant at the top of that
  file, so the figures can be reviewed as one block.

  The reference-range strip is built from nested tables and `bgcolor`, not SVG
  or background images — both are stripped or blocked by common clients.

The integration is **off unless configured**. With `RESEND_API_KEY` or
`RESEND_FROM` missing, leads are still captured and nothing is sent — so local
dev and preview deploys need no credentials.

Setup:

1. Verify your sending domain in Resend (Domains → Add Domain, then the DNS records).
2. Create an Audience if you want the campaign list; copy its id.
3. Run the sending funnel's email-columns migration in the Supabase SQL editor:
   `013_liteworldalz_email.sql` for `liteworldalz`; `liteclinician` and
   `litebcgolf` already carry the columns, from `014` and `017`. Sending **fails closed** without them — the
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
| `/act4health` | `act4health` | `act4health_leads` | 016 |
| `/lite-bcgolf` | `litebcgolf` | `litebcgolf_leads` | 017 |

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
