# /parkway — partner artwork

## `logo-ihh-healthcare.svg` — not yet supplied

`/parkway/consent` ("Before we send") is co-branded Gray Matter Solutions +
IHH Healthcare Singapore, and reads the partner's mark from this exact path:

| File                       | Where it appears                                    |
| -------------------------- | --------------------------------------------------- |
| `logo-ihh-healthcare.svg`  | The lock-up at the top of `/parkway/consent`         |

The file is IHH's to supply — it is their trademark, and the page ships without
it rather than with an approximation drawn by hand. Until it lands,
`PartnerMark` in `src/pages/parkway/consent.tsx` swaps an image that fails to
load for their name set as type in IHH navy, so the screen reads correctly
either way; that guard stays afterwards as the fallback for whichever asset
goes missing next.

Drop the real export in at the path above and it appears with no code change.
It renders at 38px tall, so export at 2x that height or supply true vector, and
trim the artboard to the mark itself — the lock-up spaces the two logos itself
and baked-in padding will push them apart. The path is declared once, in `IHH`
in `src/utils/parkway.ts`; change it there rather than renaming the file.

## Also in this directory

- `sites/` — the four Parkway Shenton site photographs used by the report. See
  that directory's own README.
- `steps/` — the two illustrated steps under the report's "What to do now?".
