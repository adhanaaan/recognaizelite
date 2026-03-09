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

- `NEXT_PUBLIC_API_URL`: Base API URL (defaults to `http://localhost:8000/api/v1`).
- `NEXT_PUBLIC_LINK_VERSION`: Set to `true` to enable link version behavior (skips auth token injection).

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
