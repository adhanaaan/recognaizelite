import React from "react";
import { RAIL_TESTIMONIALS, TESTIMONIALS } from "src/data/liteOneContent";

/** Deterministic warm tint per person, so avatars aren't all identical. */
const TINTS = ["#f77528", "#c0521a", "#7d5747", "#6c5d2e"];

function Avatar({ name, index }: { name: string; index: number }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const tint = TINTS[index % TINTS.length];
  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
      style={{ backgroundColor: tint }}
    >
      {initials}
    </span>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="size-3.5"
          fill={i < count ? "#f77528" : "#e6d6cd"}
          aria-hidden
        >
          <path d="M10 1.6l2.5 5.1 5.6.8-4 3.9 1 5.6L10 14.4l-5.1 2.6 1-5.6-4-3.9 5.6-.8L10 1.6z" />
        </svg>
      ))}
    </span>
  );
}

/** Three quote bubbles — the proof block under the sample report. */
export function QuoteBubbles() {
  return (
    <ul className="space-y-3">
      {TESTIMONIALS.map((t, i) => (
        <li
          key={t.name}
          className="flex items-start gap-3 rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-4 shadow-card"
        >
          <Avatar name={t.name} index={i} />
          <div className="min-w-0">
            <p className="text-[14px] leading-relaxed text-charcoal">“{t.quote}”</p>
            <p className="mt-2 text-[11.5px] font-semibold text-quizOutline">
              {t.name} · {t.age}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Horizontal snapping rail — the "what people say" section at the bottom. */
export function TestimonialRail() {
  return (
    <div className="lite-rail -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
      {RAIL_TESTIMONIALS.map((t, i) => (
        <article
          key={t.name}
          className="flex w-[248px] shrink-0 flex-col rounded-2xl border border-quizOutline-variant bg-quizSurface-lowest p-4 shadow-card"
        >
          <Stars count={t.stars} />
          <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-charcoal">“{t.quote}”</p>
          <div className="mt-3 flex items-center gap-2.5">
            <Avatar name={t.name} index={i} />
            <span className="min-w-0">
              <span className="block text-[12.5px] font-bold text-charcoal">{t.name}</span>
              <span className="block text-[11px] text-quizOutline">{t.detail}</span>
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
