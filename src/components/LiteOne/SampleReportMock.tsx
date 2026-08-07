import React from "react";

/**
 * A miniature of the real report, drawn in code.
 *
 * The mockup calls for a photo of a tablet showing a sample report; rather
 * than ship a grey placeholder box, this renders an actual small report card
 * — domain header, band pill, a real normal curve with a marker, a couple of
 * text blocks and the recommendation tiles — inside a paper frame. It reads
 * as an artefact, and it stays truthful about what the full report contains.
 */

const CURVE =
  "M6 66 C 34 66, 40 16, 62 16 S 90 66, 118 66";

export function SampleReportMock() {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      {/* soft ground shadow */}
      <div
        aria-hidden
        className="absolute inset-x-6 bottom-2 h-8 rounded-[50%] bg-charcoal/15 blur-xl"
      />

      <div
        className="relative rotate-[-1.4deg] rounded-[22px] border border-quizOutline-variant bg-white p-3 shadow-float"
        style={{ boxShadow: "0 22px 50px -18px rgba(51,18,0,0.30)" }}
      >
        <div className="rounded-[14px] border border-quizOutline-variant/60 bg-quizSurface-bright p-3.5">
          {/* header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[6.5px] font-bold uppercase tracking-[0.18em] text-quizOutline">
                Cognitive performance
              </p>
              <p className="mt-1 text-[10px] font-extrabold uppercase leading-tight text-charcoal">
                Trail Making
                <br />
                (Executive Function)
              </p>
            </div>
            <span className="mt-1 shrink-0 rounded-full bg-quizPrimary px-2 py-0.5 text-[6px] font-bold uppercase tracking-wider text-white">
              Adequate
            </span>
          </div>

          {/* curve */}
          <div className="mt-2.5 rounded-lg bg-[#fff1eb] p-2">
            <svg viewBox="0 0 124 84" className="w-full" aria-hidden>
              <path d={`${CURVE} L 118 72 L 6 72 Z`} fill="rgba(247,117,40,0.14)" />
              <path d={CURVE} fill="none" stroke="#f77528" strokeWidth="1.6" />
              <line x1="70" y1="18" x2="70" y2="72" stroke="#f77528" strokeWidth="1" strokeDasharray="2.5 2.5" />
              <circle cx="70" cy="21" r="2.6" fill="#fff1eb" stroke="#f77528" strokeWidth="1.4" />
              <rect x="58" y="74" width="24" height="9" rx="3" fill="#f77528" />
              <text x="70" y="80.6" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">
                62%
              </text>
            </svg>
          </div>

          {/* body copy stand-in — real headings, muted rules for the prose */}
          <p className="mt-2.5 text-[6.5px] font-bold uppercase tracking-[0.14em] text-quizOutline">
            What is executive function?
          </p>
          <div className="mt-1 space-y-[3px]" aria-hidden>
            <div className="h-[3px] w-full rounded-full bg-quizOutline-variant/70" />
            <div className="h-[3px] w-[92%] rounded-full bg-quizOutline-variant/70" />
            <div className="h-[3px] w-[74%] rounded-full bg-quizOutline-variant/50" />
          </div>

          <div className="mt-2.5 rounded-lg bg-charcoal px-2 py-1.5">
            <p className="text-[6px] font-bold uppercase tracking-[0.14em] text-white/90">
              How this affects you
            </p>
          </div>

          <p className="mt-2.5 text-[6.5px] font-bold uppercase tracking-[0.14em] text-quizOutline">
            How to improve
          </p>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5" aria-hidden>
            {[
              "goals.png",
              "routine.png",
              "checklist.png",
              "journal.png",
              "variety.png",
              "server.png",
            ].map((icon) => (
              <div
                key={icon}
                className="flex flex-col items-center gap-1 rounded-md border border-quizOutline-variant/60 bg-white p-1"
              >
                <img src={`/images/report-icons/executive/${icon}`} alt="" className="size-4" />
                <span className="h-[2.5px] w-8 rounded-full bg-quizOutline-variant/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
