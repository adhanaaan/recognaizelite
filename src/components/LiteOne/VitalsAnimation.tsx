import React from "react";

/**
 * The three things people already track, rendered as small live tiles.
 *
 * Each tile animates on its own loop so the stack reads like a dashboard
 * that's running, and a focus ring walks down the list so the eye is led
 * from Heart to Sleep to Diabetes before the "Why not your brain?" turn.
 *
 * All readouts start from a fixed value and only drift once mounted, so
 * server and client markup agree.
 */

const ACCENT = "#f77528";

function useTicker(values: readonly string[], ms: number, enabled: boolean) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setI((n) => (n + 1) % values.length), ms);
    return () => clearInterval(id);
  }, [values.length, ms, enabled]);
  return values[i];
}

function HeartVisual({ live }: { live: boolean }) {
  return (
    <svg viewBox="0 0 56 44" className="h-11 w-14" aria-hidden>
      <path
        className={live ? "lite-heartbeat" : undefined}
        style={{ transformOrigin: "14px 20px" }}
        d="M14 32.5C14 32.5 4.5 25.9 4.5 18.6c0-3.5 2.7-6.1 6-6.1 2 0 3.7 1 4.7 2.5 1-1.5 2.7-2.5 4.7-2.5 3.3 0 6 2.6 6 6.1 0 7.3-9.5 13.9-9.5 13.9a1.6 1.6 0 0 1-1.6 0Z"
        fill={ACCENT}
      />
      {/* Faint full trace underneath, so the waveform is always legible, with
          the animated pulse riding over it. */}
      <path
        d="M27 22h5l2.4-7 3.4 14 2.6-8.5 1.8 4.5H56"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.28"
      />
      <path
        className={live ? "lite-ecg" : undefined}
        d="M27 22h5l2.4-7 3.4 14 2.6-8.5 1.8 4.5H56"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={live ? 1 : 0}
      />
    </svg>
  );
}

function SleepVisual({ live }: { live: boolean }) {
  return (
    <svg viewBox="0 0 56 44" className="h-11 w-14" aria-hidden>
      <defs>
        <mask id="lite-moon-mask">
          <rect width="56" height="44" fill="#000" />
          <circle cx="15" cy="21" r="9.5" fill="#fff" />
          <circle cx="20.5" cy="17.5" r="8.5" fill="#000" />
        </mask>
      </defs>
      <g className={live ? "lite-rock" : undefined} style={{ transformOrigin: "15px 21px" }}>
        <rect width="56" height="44" fill={ACCENT} mask="url(#lite-moon-mask)" />
      </g>

      {/* rising z's */}
      {[0, 1, 2].map((n) => (
        <text
          key={n}
          x={24 + n * 1.5}
          y={15 - n * 1.5}
          fontSize={6 - n * 0.8}
          fontWeight="800"
          fill={ACCENT}
          opacity="0"
          className={live ? "lite-zfloat" : undefined}
          style={live ? { animationDelay: `${n * 1}s` } : undefined}
        >
          z
        </text>
      ))}

      {/* sleep-stage bars */}
      {[0, 1, 2, 3, 4].map((n) => (
        <rect
          key={n}
          x={31 + n * 5}
          y={14}
          width="3"
          height="16"
          rx="1.5"
          fill={ACCENT}
          opacity={0.28 + n * 0.12}
          className={live ? "lite-bar" : undefined}
          style={live ? { animationDelay: `${n * 0.28}s` } : undefined}
        />
      ))}
    </svg>
  );
}

function GlucoseVisual({ live }: { live: boolean }) {
  return (
    <svg viewBox="0 0 56 44" className="h-11 w-14" aria-hidden>
      <path
        className={live ? "lite-bob" : undefined}
        style={{ transformOrigin: "14px 22px" }}
        d="M14 9c0 0 7.5 8.4 7.5 13.6A7.5 7.5 0 0 1 14 30a7.5 7.5 0 0 1-7.5-7.4C6.5 17.4 14 9 14 9Z"
        fill={ACCENT}
      />
      <circle cx="11.4" cy="24" r="2.1" fill="#fff" opacity="0.65" />
      <path
        className={live ? "lite-spark" : undefined}
        d="M27 26.5l4.5-4 4 5.5 4.5-9.5 4 6.5 4-3.5H56"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}

const HEART_BPM = ["68", "71", "69", "73", "70"] as const;
const SLEEP_HRS = ["7h 12m", "6h 58m", "7h 24m", "7h 03m"] as const;
const GLUCOSE = ["5.4", "5.6", "5.3", "5.7"] as const;

export function VitalsAnimation() {
  const [live, setLive] = React.useState(false);
  const [focus, setFocus] = React.useState(0);

  React.useEffect(() => {
    // Only start the loops on the client, and skip them entirely when the
    // visitor has asked for reduced motion.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    setLive(true);
    const id = setInterval(() => setFocus((n) => (n + 1) % 3), 2600);
    return () => clearInterval(id);
  }, []);

  const bpm = useTicker(HEART_BPM, 3400, live);
  const sleep = useTicker(SLEEP_HRS, 4600, live);
  const glucose = useTicker(GLUCOSE, 4000, live);

  const rows = [
    { label: "Heart", value: `${bpm} bpm`, visual: <HeartVisual live={live} /> },
    { label: "Sleep", value: sleep, visual: <SleepVisual live={live} /> },
    { label: "Diabetes", value: `${glucose} mmol/L`, visual: <GlucoseVisual live={live} /> },
  ];

  return (
    <ul className="mx-auto w-full max-w-[340px] space-y-2.5">
      {rows.map((row, idx) => {
        const active = live && focus === idx;
        return (
          <li
            key={row.label}
            className={[
              "lite-rise flex items-center gap-3 rounded-2xl border bg-quizSurface-lowest/80 px-4 py-3 backdrop-blur-sm",
              "transition-all duration-500 ease-out",
              active
                ? "border-quizPrimary/45 shadow-float scale-[1.025]"
                : "border-quizOutline-variant/70 shadow-card",
            ].join(" ")}
            style={{ animationDelay: `${140 + idx * 110}ms` }}
          >
            <span className="shrink-0">{row.visual}</span>
            <span className="flex-1 text-left text-[19px] font-bold leading-none text-charcoal">
              {row.label}
            </span>
            <span
              className={[
                "shrink-0 tabular-nums text-[13px] font-semibold transition-colors duration-500",
                active ? "text-quizPrimary" : "text-quizOutline",
              ].join(" ")}
            >
              {row.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
