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

`/lite-worldalzmonth`, `/lite-clinician`, `/lite-bcgolf` and `/lite-event`
mail each lead their result on submit and add them to a Resend Audience. All of
it happens server-side in `/api/save-lead`, after the lead row is written.

Each uses a different template, chosen per funnel in `EMAIL_CLINICS`:

- **consumer** (`liteResultEmail.ts`) — explains the result. Used by `liteworldalz`.
- **event** (`eventResultEmail.ts`) — a courtesy note to a guest at an event:
  the result stated once and large, one gold rule, one action. Used by
  `litebcgolf` and `liteevent`.

  It names the occasion only when its funnel has one. `litebcgolf` carries the
  golf tournament in its `EMAIL_CLINICS` entry; `liteevent` is one link reused
  across many events and carries none, so its mail thanks the reader without
  naming an event rather than naming whichever one was hard-coded last.
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
   `013_liteworldalz_email.sql` for `liteworldalz`; `liteclinician`,
   `litebcgolf` and `liteevent` already carry the columns, from `014`, `017`
   and `018`. Sending **fails closed** without them — the
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
| `/lite-event` | `liteevent` | `liteevent_leads` | 018 |
| `/lite-event-template` | `liteevent` | `liteevent_leads` + `liteevent_report_interest` | 018, 020 |
| `/lite-event/ntuhomecoming` | `liteevent` | same two, `utm_campaign = 'ntuhomecoming'` | 018, 020 |
| `/clinic-signup` | `liteevent` | same two, `utm_campaign = 'clinic-signup'` | 018, 019, 020, 021 |
| `/clinic-signup-id` | `liteevent` | same two, `utm_campaign = 'clinic-signup-id'` | 018, 019, 020, 022 |

`/lite-clinician` has eight pages, not nine: it carries no voucher page and no
commerce CTA, so `report-full` does not exist for it. The clinician next step is
still undecided; it lands at the foot of that funnel's `report.tsx`.

`/lite-event` is the corporate-event funnel: `/lite-two` page for page, with
one difference — it mails the result. At an event the visitor hands the iPad
back and the screen is wiped for the next person, so the mail is the only copy
of the result they keep; `/lite-two` is absent from `EMAIL_CLINICS` and sends
nothing. One table serves every event and `?utm_campaign=` separates them after
the fact, so a new booth needs a link rather than a migration and a deploy.

`/lite-event-template` is `/lite-event` page for page, and the place a change
is tried before it is folded back. The change on trial is the report's closing:
the price card and the voucher button are gone, and the report instead ends on
an "I'm interested" button under the three steps and a "What happens next" card
that names the booth as the next step and closes on one tickbox, "Send me brain
health tips, and early access when we launch." Both are recorded in
`liteevent_report_interest` (migration `020`) through
`/api/lite-report-interest`: one row per run, keyed by the same `attempt_id` as
the lead, so who raised their hand joins back to who they are. The button is
one-way; the tickbox is upserted on every change, so the row is always the
current state. Each flag has a timestamp beside it, which is how "never
touched" is told apart from "ticked, then unticked". Leads still go to
`liteevent_leads`, and `report-full` still exists there, unlinked.

`/lite-event/ntuhomecoming` is the event link for NTU Homecoming:
`/lite-event-template` page for page, CTA trial included, with its own routes
and sessionStorage namespace but no table of its own. Its identifier in the
database is the campaign: every row it writes carries
`utm_campaign = 'ntuhomecoming'` (and `funnel = '/lite-event/ntuhomecoming'`
in the interest table), so the evening is one `where` clause on the shared
tables. The route nests under `/lite-event` because it is one of that family's
occasions; Next resolves it to its own directory without touching `/lite-event`'s
pages. Adding the next occasion is the same recipe: a `LiteVariant` with its
campaign, and the pages copied with the variant swapped.

`/clinic-signup-id` is the Indonesian clinic funnel: `/clinic-signup` page for
page, with its own routes, campaign and sessionStorage namespace, and two
differences that both come from where it runs.

Its languages are English and Bahasa Indonesia, and nothing else. The
/lite-event family's picker offers English, 中文 and Bahasa Melayu out of
`src/i18n/liteEvent.ts`; this funnel has its own store, copy and toggle in
`src/i18n/clinicSignupId.ts` and `src/i18n/clinicSignupIdCopy.ts`, keyed by its
own `ClinicSignupIdLang`. Keeping the two apart is deliberate: widening
`LiteEventLang` would have forced an Indonesian entry into every copy map the
other funnels own, and a clinician who picked 中文 on a /lite-event link in the
same browser would arrive here in a language this funnel does not translate.
The Indonesian copy is complete — landing, quiz bank
(`brainHealthQuestions.id.ts`), stat cards, loading and all four report variants
(`clinicSignupIdReportCopy.ts`) — and picking it also sets the app-wide language
to `BAHASA`, which is the Indonesian slot in `src/locales`, so the shared Symbol
Matching leg follows. Setting `BAHASA_INDONESIA = false` takes the picker off
the page and the funnel runs in English.

Its consent is Indonesia's, not Singapore's. `/clinic-signup` asks one
compulsory tickbox that bundles the processing with the marketing; UU No. 27
Tahun 2022 (UU PDP) does not let one sentence carry both purposes — Art. 22(2)
wants each purpose stated and separable, and Art. 22(3) voids a consent that
fails it. So this landing page asks twice: a **required** consent covering the
collection and processing of the name, email, quiz answers and cognitive result
(health data under Art. 4(2)) and the transfer of it out of Indonesia (Art. 56),
and an **optional** marketing consent the run does not depend on. They land in
`consent_analytics` and `consent_marketing`, and `consent_version` (migration
`022`) records which wording was agreed to, because Art. 20(2) puts the burden of
proving a consent on the controller. Below the hero sits the Art. 21(1) notice —
lawful basis, purpose, data types, details collected, processing period,
retention, transfer, rights — all of it in
`src/data/clinicSignupIdConsentCopy.ts`.

Two placeholders must be filled before the link goes to anyone in Indonesia:
`GMS_PDP_CONTACT_EMAIL` (`src/utils/liteOne.ts`), the address Art. 21 rights are
exercised at, and `GMS_PRIVACY_POLICY_URL` beside it. The retention period the
notice states, `CLINIC_SIGNUP_ID_RETENTION_MONTHS`, is 24 months by assumption
and wants a decision from whoever owns the data policy.

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
