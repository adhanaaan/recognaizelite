# /act4health report — "What happens next" step images

The report's three-step section renders one illustration per step. Drop the
design's exports here under these exact names:

| File                   | Step | Shows                                                  |
| ---------------------- | ---- | ------------------------------------------------------ |
| `step-1-whatsapp.png`  | 1    | Booking a slot in a WhatsApp chat with Act4Health Clinic |
| `step-2-games.png`     | 2    | The games on a phone, a tablet and a laptop             |
| `step-3-report.png`    | 3    | A cognitive performance report across four domains      |

`StepImage` in `src/pages/act4health/report.tsx` hides any image that fails to
load, so a missing file leaves that step rendering as text only — no broken
image, and no code change needed once the file lands.

Export at roughly 1080px wide (the card renders at up to 560px CSS, so 2x
covers retina) and keep them reasonably compressed; they sit mid-report.
