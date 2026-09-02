# /parkway report — Parkway Shenton site photographs

The report shows the four sites twice: as the scrolling cards under step 1 of
"What to do now?", and as the tappable list on the consultation card. Both read
their images from here, under these exact names:

| File                   | Site                                                |
| ---------------------- | --------------------------------------------------- |
| `republic-plaza.jpg`   | Medical Clinic, Republic Plaza                       |
| `ang-mo-kio.jpg`       | Family Medicine Clinic, Ang Mo Kio                   |
| `mount-elizabeth.jpg`  | Executive Health Screeners, Mount Elizabeth Hospital |
| `woodleigh-mall.jpg`   | Parkway MediCentre @ The Woodleigh Mall              |

All four are in place, supplied by Parkway. `SiteThumb` in
`src/pages/parkway/report.tsx` still swaps any image that fails to load for a
plain tile — that guard is what let the cards and the list ship ahead of these
files, and it stays as the fallback for whichever one goes missing next (a
renamed file, a bad upload) rather than only protecting a one-time gap.

The card renders the image at 216 × 125 CSS px and the list row at 40 × 40, so
export around 640px wide (well past 2x for the larger of the two) and crop to
roughly 7:4 — `object-cover` handles the rest. The filenames above are the
contract; if a site's name changes, change it in `PARKWAY_SITES`
(`src/utils/parkway.ts`) rather than renaming the file.
