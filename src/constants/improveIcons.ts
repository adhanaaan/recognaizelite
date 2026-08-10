/**
 * Icon art for the "How to improve" recommendation cards, keyed by cognitive
 * domain title (the same `DomainReport.title` the report API returns).
 *
 * Each list is positional: index N pairs with `domain.improve[N]`.
 *
 * Shared by the print report (/report) and the ReCOGnAIze Lite report
 * (/lite-one/report), which shows the Processing Speed set inside the
 * "How to improve?" popup.
 */
export const improveIconPaths: Record<string, string[]> = {
  "Working Memory": [
    "/images/report-icons/memory/puzzle.png",
    "/images/report-icons/memory/link.png",
    "/images/report-icons/memory/breakdown.png",
    "/images/report-icons/memory/story.png",
    "/images/report-icons/memory/explain.png",
    "/images/report-icons/memory/family.png",
  ],
  Attention: [
    "/images/report-icons/attention/mindful.png",
    "/images/report-icons/attention/chess.png",
    "/images/report-icons/attention/clock.png",
    "/images/report-icons/attention/breathe.png",
    "/images/report-icons/attention/routine.png",
    "/images/report-icons/attention/monitor.png",
  ],
  "Executive Function": [
    "/images/report-icons/executive/goals.png",
    "/images/report-icons/executive/routine.png",
    "/images/report-icons/executive/server.png",
    "/images/report-icons/executive/checklist.png",
    "/images/report-icons/executive/variety.png",
    "/images/report-icons/executive/journal.png",
  ],
  "Processing Speed": [
    "/images/report-icons/processing/math.png",
    "/images/report-icons/processing/clock.png",
    "/images/report-icons/processing/book.png",
    "/images/report-icons/processing/timer.png",
    "/images/report-icons/processing/keyboard.png",
    "/images/report-icons/processing/human.png",
  ],
};
