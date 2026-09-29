# /act4health report — "What happens next" step images

The report's three-step section renders one illustration per step. Only the
one that is Act4Health's own lives here:

| File                   | Step | Shows                                                  |
| ---------------------- | ---- | ------------------------------------------------------ |
| `step-1-whatsapp.png`  | 1    | Booking a slot in a WhatsApp chat with Act4Health Clinic |

Steps 2 and 3 show the product rather than the clinic, so they come from the
directory every report shares — public/images/report/steps/.

`StepImage` (src/components/LiteOne/ReportV2/StepImage.tsx) hides any image
that fails to load, so a missing file leaves that step rendering as text only —
no broken image, and no code change needed once the file lands.

Export at roughly 1080px wide (the card renders at up to 560px CSS, so 2x
covers retina) and keep them reasonably compressed; they sit mid-report.
