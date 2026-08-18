import React from "react";

/**
 * Charts and framing pieces for the /lite-one/report-lab layout.
 *
 * The layout speaks to the visitors who picked the competitive framing on the
 * hook screen, so every visual here is built to be read as a scoreboard: a
 * curve with the visitor's mark on it, a five-point radar with four axes still
 * empty, a progress bar that says how much of the picture is missing.
 */

export const RANK_GRADIENT = "linear-gradient(100deg,#FF8A1F 0%,#F9550F 52%,#D62F16 100%)";

/** Fires once the element has been on screen, so charts animate on arrival. */
export function useOnScreen<T extends HTMLElement>(rootMargin = "-12% 0px") {
  const ref = React.useRef<T | null>(null);
  const [seen, setSeen] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, seen]);

  return { ref, seen };
}

/** Section wrapper: consistent gutters, max width and reveal-on-scroll. */
export function Band({
  children,
  className = "",
  inner = "",
}: {
  children: React.ReactNode;
  className?: string;
  inner?: string;
}) {
  const { ref, seen } = useOnScreen<HTMLDivElement>();
  return (
    <section ref={ref} className={`relative px-5 sm:px-8 ${className}`}>
      <div
        className={[
          "mx-auto w-full max-w-[560px] transition-all duration-[900ms] ease-out",
          seen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          inner,
        ].join(" ")}
      >
        {children}
      </div>
    </section>
  );
}

/** Small uppercase label that opens each section. */
export function Eyebrow({
  children,
  tone = "warm",
}: {
  children: React.ReactNode;
  tone?: "warm" | "light";
}) {
  return (
    <p
      className={[
        "text-[10.5px] font-extrabold uppercase tracking-[0.24em]",
        tone === "light" ? "text-white/55" : "text-[#B4653C]",
      ].join(" ")}
    >
      {children}
    </p>
  );
}

/**
 * The visitor's place on the age-band curve.
 *
 * The x axis is percentile, so the marker sits where the visitor scored and
 * the shaded area to its left is everyone they beat. Slow scores land left,
 * fast scores land right, which is the direction people already expect.
 */
export function ScoreCurve({ percentile }: { percentile: number }) {
  const { ref, seen } = useOnScreen<HTMLDivElement>("-8% 0px");
  const W = 520;
  const H = 190;
  const clamped = Math.min(97, Math.max(3, percentile));
  const x = (clamped / 100) * W;

  // Gaussian silhouette sampled across the width, then closed into an area.
  const points = React.useMemo(() => {
    const list: Array<[number, number]> = [];
    for (let i = 0; i <= 120; i += 1) {
      const p = (i / 120) * 100;
      const z = (p - 50) / 15.5;
      const y = H - 26 - Math.exp(-0.5 * z * z) * (H - 62);
      list.push([(p / 100) * W, y]);
    }
    return list;
  }, [H, W]);

  const line = points.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const markerY = points.reduce((best, [px, py]) =>
    Math.abs(px - x) < Math.abs(best[0] - x) ? [px, py] : best
  , points[0])[1];

  return (
    <div ref={ref} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Your score sits above ${percentile} percent of your age group`}>
        <defs>
          <linearGradient id="rl-fill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFC489" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#F9550F" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="rl-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E9C6B2" />
            <stop offset="62%" stopColor="#FF8A1F" />
            <stop offset="100%" stopColor="#D62F16" />
          </linearGradient>
          <clipPath id="rl-reveal">
            <rect x="0" y="0" width={W} height={H} style={{ transform: `scaleX(${seen ? 1 : 0})`, transformOrigin: "0 0", transition: "transform 1.15s cubic-bezier(.22,.8,.2,1)" }} />
          </clipPath>
        </defs>

        {/* everyone the visitor is ahead of */}
        <g clipPath="url(#rl-reveal)">
          <path
            d={`M0 ${H - 26} ${points.filter(([px]) => px <= x).map(([px, py]) => `L${px.toFixed(1)} ${py.toFixed(1)}`).join(" ")} L${x.toFixed(1)} ${H - 26} Z`}
            fill="url(#rl-fill)"
          />
          <path d={line} fill="none" stroke="url(#rl-stroke)" strokeWidth="2.4" strokeLinecap="round" />
        </g>

        {/* baseline */}
        <line x1="0" y1={H - 26} x2={W} y2={H - 26} stroke="#E7D3C7" strokeWidth="1.4" />

        {/* the visitor's mark: a full-height rule so a fast score reads as a
            position on the axis rather than a dot lost on the flat tail */}
        <g
          style={{
            opacity: seen ? 1 : 0,
            transform: seen ? "none" : "translateY(10px)",
            transition: "opacity .5s ease .95s, transform .6s cubic-bezier(.22,.8,.2,1) .95s",
          }}
        >
          <line x1={x} y1="30" x2={x} y2={H - 26} stroke="#D62F16" strokeWidth="2" strokeDasharray="5 5" />
          <circle cx={x} cy={markerY} r="9.5" fill="#fff" />
          <circle cx={x} cy={markerY} r="6" fill="#D62F16" />
          <g transform={`translate(${Math.min(W - 34, Math.max(34, x))} 18)`}>
            <rect x="-33" y="-14" width="66" height="24" rx="12" fill="#D62F16" />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              className="text-[11px] font-extrabold"
              style={{ letterSpacing: "0.12em" }}
            >
              YOU
            </text>
          </g>
        </g>
      </svg>

      <div className="mt-1 flex justify-between text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#B79C8E]">
        <span>Slower</span>
        <span>Average</span>
        <span>Faster</span>
      </div>
    </div>
  );
}

/**
 * Five-point radar with one axis filled.
 *
 * The empty area is the argument: it shows the visitor how narrow a single
 * task is next to the whole profile, without any copy having to say so.
 */
export function DomainRadar({
  axes,
  filled,
}: {
  axes: string[];
  filled: Record<string, number>;
}) {
  const { ref, seen } = useOnScreen<HTMLDivElement>("-8% 0px");
  const W = 340;
  const H = 282;
  const cx = W / 2;
  const cy = 132;
  const r = 84;

  const point = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius] as const;
  };

  const rings = [0.35, 0.7, 1];
  const shape = axes
    .map((axis, i) => {
      const value = filled[axis] ?? 0;
      const [px, py] = point(i, Math.max(r * 0.08, r * value));
      return `${i === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div ref={ref} className="mx-auto w-full max-w-[330px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Cognitive profile radar with one of five domains measured">
        <defs>
          <radialGradient id="rl-radar" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFB55C" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#F9550F" stopOpacity="0.45" />
          </radialGradient>
        </defs>

        {rings.map((ring) => (
          <polygon
            key={ring}
            points={axes.map((_, i) => point(i, r * ring).map((n) => n.toFixed(1)).join(",")).join(" ")}
            fill="none"
            stroke="#EEDACD"
            strokeWidth="1"
          />
        ))}

        {axes.map((axis, i) => {
          const [px, py] = point(i, r);
          const [lx, ly] = point(i, r + 21);
          const measured = (filled[axis] ?? 0) > 0;
          return (
            <g key={axis}>
              <line x1={cx} y1={cy} x2={px} y2={py} stroke="#EEDACD" strokeWidth="1" />
              {!measured && <circle cx={px} cy={py} r="3.5" fill="#FFF8F3" stroke="#E3C4B0" strokeWidth="1.4" />}
              <text
                x={lx}
                y={ly}
                textAnchor={lx > cx + 4 ? "start" : lx < cx - 4 ? "end" : "middle"}
                dominantBaseline="middle"
                className={[
                  "text-[9px] font-bold uppercase",
                  measured ? "fill-[#C43C0E]" : "fill-[#BCA294]",
                ].join(" ")}
                style={{ letterSpacing: "0.08em" }}
              >
                {axis}
              </text>
            </g>
          );
        })}

        <path
          d={`${shape} Z`}
          fill="url(#rl-radar)"
          stroke="#D62F16"
          strokeWidth="2"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: seen ? "scale(1)" : "scale(0.35)",
            opacity: seen ? 1 : 0,
            transition: "transform 1s cubic-bezier(.22,.8,.2,1) .1s, opacity .6s ease .1s",
          }}
        />
      </svg>
    </div>
  );
}

/** Benchmark, train, retest. Lifted from the funnel's existing value story. */
export function BaselineSteps() {
  const steps = [
    { n: "01", label: "Benchmark today", icon: FlagIcon },
    { n: "02", label: "Train on purpose", icon: WeightIcon },
    { n: "03", label: "Retest later", icon: BarsIcon },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {steps.map(({ n, label, icon: Icon }, i) => (
        <div key={n} className="relative text-center">
          {i > 0 && (
            <span aria-hidden className="absolute left-0 top-[26px] h-[1.5px] w-full -translate-x-1/2 bg-white/25" />
          )}
          <div className="relative mx-auto grid size-[52px] place-items-center rounded-full border border-white/35 bg-white/10 backdrop-blur-sm">
            <Icon />
          </div>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/50">{n}</p>
          <p className="mt-1 text-[13px] font-bold leading-tight text-white">{label}</p>
        </div>
      ))}
    </div>
  );
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px] text-white">
      <path d="M6 21V4h11l-2 4 2 4H6" {...stroke} />
    </svg>
  );
}

function WeightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px] text-white">
      <path d="M4 9v6M20 9v6M7 7v10M17 7v10M7 12h10" {...stroke} />
    </svg>
  );
}

function BarsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px] text-white">
      <path d="M5 20V13M12 20V6M19 20v-9" {...stroke} />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[15px]">
      <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" {...stroke} />
    </svg>
  );
}

export function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[15px]">
      <path d="M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3 2.7-5 6-5s6 2 6 5M17 6.2a3 3 0 010 5.6M18 14.4c2 .6 3 2 3 5.6" {...stroke} />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[15px]">
      <path d="M6 11h12v9H6zM9 11V8a3 3 0 016 0v3" {...stroke} />
    </svg>
  );
}

export function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[16px]">
      <path d="M12 4v11M8 8l4-4 4 4M5 15v3.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V15" {...stroke} />
    </svg>
  );
}
