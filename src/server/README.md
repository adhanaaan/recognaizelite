# Server-Only Code

This directory contains server-side only code that must **NEVER** be exposed to the client.

## Security Measures

1. **API Routes Protection**: This code is ONLY imported in `pages/api/*` routes, which are server-side only by default in Next.js Pages Router. They are never bundled to the client.

2. **Sensitive Data**: Contains proprietary scoring algorithms, statistical models, and business logic that must remain confidential.

3. **Build-time Separation**: Vercel's Next.js deployment automatically handles server-side code splitting. API routes run exclusively on serverless functions and are never sent to the browser.

## Contents

- `report.ts`: Report generation algorithms with scoring formulas and statistical calculations
- `data/report_data.json`: Cognitive domain definitions and severity level descriptions

## Usage

Only import from this directory in:

- API routes (`pages/api/*`)
- Server Components (App Router)
- `getServerSideProps` / `getStaticProps` (Pages Router)

**DO NOT** import in:

- Client Components
- Pages outside of API routes
- Any file that runs in the browser

## Violation Prevention

**Important:** Only import these files in `pages/api/*` routes.

If you accidentally import this code in client-side pages or components, the sensitive data will be exposed in the browser bundle. Always keep imports limited to API routes only.

To verify security: Check your production build - search for "SCORE_STATS" in browser DevTools. It should NOT appear in any client JavaScript files.
