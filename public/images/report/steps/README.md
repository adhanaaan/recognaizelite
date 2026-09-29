# Report step images — shared by every funnel

The illustrated steps under a report's "What to do now?" section. They show
the product, not a partner, so every funnel that illustrates those steps reads
them from here rather than keeping its own copy:

| File                | Step                          | Shows                                              |
| ------------------- | ----------------------------- | -------------------------------------------------- |
| `step-2-games.png`  | Play a 10 minute brain health game | The games on a phone, a tablet and a laptop   |
| `step-3-report.png` | Get your full report          | A cognitive performance report across four domains |

Used by the /parkway, /parkwayshenton and /act4health reports. The paths are
declared once, in `REPORT_STEP_IMAGES` in
`src/components/LiteOne/ReportV2/StepImage.tsx`; change them there rather than
renaming a file.

A step image that belongs to one partner — /act4health's WhatsApp booking
chat, say — stays in that funnel's own directory.

`StepImage` hides any image that fails to load, so a missing file leaves its
step rendering as text only. Export at roughly 1080px wide (the card renders
at up to 560px CSS, so 2x covers retina) and keep them compressed; they sit
mid-report.
