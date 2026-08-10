import React from "react";

/**
 * The "?" from the hook screen, ringed by the same 3D symbols the Symbol
 * Matching game uses. Two jobs: it makes the question the loudest thing on
 * the screen, and it quietly previews the visual vocabulary of the test the
 * visitor is about to take.
 *
 * The ring spins; each icon counter-spins at the same rate so it never ends
 * up upside down. Nesting keeps the three transforms from fighting: the
 * outer node places the icon on the circle, the middle node cancels that
 * placement rotation, and the inner node carries the animation.
 */

const ORBIT_ICONS = [
  "star.png",
  "sun.png",
  "moon.png",
  "flash.png",
  "setting.png",
  "lock.png",
] as const;

export function BrainOrbit({ size = 208 }: { size?: number }) {
  const [live, setLive] = React.useState(false);
  const radius = size / 2 - 22;

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setLive(true);
  }, []);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} aria-hidden>
      {/* breathing halo */}
      <div
        className={[
          "absolute inset-6 rounded-full bg-quizPrimary/25 blur-2xl",
          live ? "lite-breathe" : "opacity-60",
        ].join(" ")}
      />
      <div className="absolute inset-3 rounded-full border border-quizPrimary/15" />

      <div className={["absolute inset-0", live ? "lite-orbit" : ""].join(" ")}>
        {ORBIT_ICONS.map((icon, i) => {
          const angle = (360 / ORBIT_ICONS.length) * i;
          return (
            <div
              key={icon}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `rotate(${angle}deg) translateY(-${radius}px)` }}
            >
              <div style={{ transform: `rotate(${-angle}deg)` }}>
                <div className={live ? "lite-orbit-counter" : undefined}>
                  <img
                    src={`/images/task-2/${icon}`}
                    alt=""
                    className="size-8 -translate-x-1/2 -translate-y-1/2 drop-shadow-sm sm:size-9"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={[
            "font-display text-[76px] font-extrabold leading-none text-quizPrimary sm:text-[88px]",
            live ? "lite-bob" : "",
          ].join(" ")}
        >
          ?
        </span>
      </div>
    </div>
  );
}
