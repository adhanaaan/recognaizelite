# /clinic-signup — partner artwork

## `logo-eisai.svg` — not yet supplied

`/clinic-signup/consent` ("Before you begin") is co-branded Gray Matter
Solutions + Eisai, and reads the partner's mark from this exact path:

| File             | Where it appears                                  |
| ---------------- | ------------------------------------------------- |
| `logo-eisai.svg` | The lock-up at the top of `/clinic-signup/consent` |

The file is Eisai's to supply — it is their trademark, and the page ships
without it rather than with an approximation drawn by hand. Until it lands,
`PartnerMark` in `src/pages/clinic-signup/consent.tsx` swaps an image that fails
to load for their name set as type in Eisai red, so the screen reads correctly
either way; that guard stays afterwards as the fallback for whichever asset goes
missing next.

Drop the real export in at the path above and it appears with no code change. It
renders at 32px tall, so export at 2x that height or supply true vector, and trim
the artboard to the mark itself — the lock-up spaces the two logos itself and
baked-in padding will push them apart. The path is declared once, in `EISAI` in
`src/utils/eisai.ts`; change it there rather than renaming the file.
