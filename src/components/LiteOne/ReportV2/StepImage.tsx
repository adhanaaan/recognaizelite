import React from "react";

/**
 * The step illustrations every funnel's report shares, from the one general
 * directory (see public/images/report/steps/README.md). A funnel whose step
 * needs its own picture — /act4health's WhatsApp chat — keeps that file in its
 * own directory and passes the path to StepImage directly.
 */
export const REPORT_STEP_IMAGES = {
  games: "/images/report/steps/step-2-games.png",
  report: "/images/report/steps/step-3-report.png",
} as const;

/**
 * One step's illustration. Removes itself if the asset 404s, so a step whose
 * image hasn't been committed yet still reads as a normal text step instead of
 * a broken-image placeholder.
 */
export function StepImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) return null;
  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-[#F2DDCE] bg-white">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="block h-auto w-full"
      />
    </div>
  );
}
