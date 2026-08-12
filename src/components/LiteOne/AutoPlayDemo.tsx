import React from "react";
import { HandIcon } from "src/components/Icons/HandIcon";

/**
 * A miniature Symbol Matching board that plays itself.
 *
 * The point is to answer "what am I about to do?" before the visitor has to
 * commit to a tutorial. It shows one prompt symbol, the legend that maps
 * symbols to numbers, and a hand tapping the right key — then reshuffles the
 * legend, which is the one rule people miss when they start cold.
 *
 * Deliberately standalone rather than a real <Task2Game>: it must not touch
 * the game's module-level shuffle state, and it uses a 3-symbol board so the
 * whole loop is readable at a glance.
 *
 * The legend numbers and the keypad both run 0-1-2. The source mockup pairs a
 * 0/1/2 legend with a 1/2/3 pad, which can't be played correctly.
 */

const SYMBOLS = ["star.png", "sun.png", "moon.png"] as const;

/** ms offsets within one round */
const T_HIGHLIGHT = 700;
const T_HAND = 1150;
const T_PRESS = 1650;
const T_ROUND = 2600;

type Phase = "idle" | "highlight" | "hand" | "press";

/**
 * Which keypad slot the hand presses each round: 0, then 2, then 1. A demo
 * that always lands on the same key looks scripted rather than illustrating
 * "the legend reshuffles, read it every time" — the point of this component.
 */
const ANSWER_SLOTS = [0, 2, 1] as const;

/**
 * Legend order for a round: rotate so the mapping visibly changes each turn,
 * chosen so the prompt symbol (which cycles 0-1-2 with the round) always lands
 * in this round's `ANSWER_SLOTS` slot.
 */
function legendForRound(round: number) {
  const promptSymbol = round % SYMBOLS.length;
  const answerSlot = ANSWER_SLOTS[round % ANSWER_SLOTS.length];
  const shift = (promptSymbol - answerSlot + SYMBOLS.length) % SYMBOLS.length;
  return SYMBOLS.map((_, i) => (i + shift) % SYMBOLS.length);
}

export function AutoPlayDemo() {
  const [round, setRound] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Static, fully-formed frame: the answer is already on screen.
      setPhase("press");
      return;
    }
    setPlaying(true);

    const onVisibility = () => setPlaying(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  React.useEffect(() => {
    if (!playing) return;
    setPhase("idle");
    const timers = [
      setTimeout(() => setPhase("highlight"), T_HIGHLIGHT),
      setTimeout(() => setPhase("hand"), T_HAND),
      setTimeout(() => setPhase("press"), T_PRESS),
      setTimeout(() => setRound((r) => r + 1), T_ROUND),
    ];
    return () => timers.forEach(clearTimeout);
  }, [round, playing]);

  const legend = legendForRound(round);
  // The prompt cycles through the symbols; `answer` is the legend slot it sits in.
  const promptSymbol = round % SYMBOLS.length;
  const answer = legend.indexOf(promptSymbol);
  const revealed = phase === "highlight" || phase === "hand" || phase === "press";
  const pressed = phase === "press";

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="mb-3 flex justify-center">
        <span className="rounded-full border border-quizOutline-variant bg-quizSurface-lowest px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-quizOutline">
          Demo · plays itself
        </span>
      </div>

      {/* prompt symbol */}
      <div className="relative flex h-[104px] items-center justify-center">
        <div
          aria-hidden
          className="absolute size-24 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(247,117,40,0.14), transparent 70%)" }}
        />
        <img
          key={`${round}-${promptSymbol}`}
          src={`/images/task-2/${SYMBOLS[promptSymbol]}`}
          alt=""
          className="relative size-[78px] animate-slide-right drop-shadow-md"
        />
      </div>

      {/* legend */}
      <div className="mt-2 rounded-3xl border border-[#ffdbcb] bg-quizSurface-lowest/85 px-3 py-3 shadow-card backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-2">
          {legend.map((symbolIdx, slot) => {
            const isAnswer = slot === answer;
            return (
              <div
                key={slot}
                className={[
                  "flex flex-col items-center rounded-2xl py-1.5 transition-all duration-300",
                  revealed && isAnswer ? "scale-105 bg-quizPrimary/10 ring-2 ring-quizPrimary/50" : "",
                ].join(" ")}
              >
                <span className="text-[13px] font-bold text-charcoal">{slot}</span>
                <img
                  src={`/images/task-2/${SYMBOLS[symbolIdx]}`}
                  alt=""
                  className="mt-0.5 size-8"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* keypad */}
      <div className="mt-3 rounded-3xl border border-[#ffdbcb] bg-quizSurface-lowest/85 px-3 py-3 shadow-card backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          {legend.map((_, key) => {
            const isAnswer = key === answer;
            const isDown = pressed && isAnswer;
            return (
              <div key={key} className="relative">
                <div
                  className={[
                    "flex size-[52px] items-center justify-center rounded-full text-[22px] font-extrabold text-white transition-all duration-200",
                    isDown ? "scale-95 ring-4 ring-quizPrimary/30" : "",
                  ].join(" ")}
                  style={{
                    background: isDown
                      ? "linear-gradient(180deg, #b8480f 0%, #90370a 100%)"
                      : "linear-gradient(180deg, #f77528 0%, #b8480f 100%)",
                    filter: "drop-shadow(0px 4px 4px rgba(0,0,0,0.12))",
                  }}
                >
                  {key}
                </div>

                {/* the tapping hand, parented to the key so there's no
                    coordinate maths to drift across screen widths */}
                {isAnswer && (phase === "hand" || phase === "press") && (
                  <div
                    className={[
                      "pointer-events-none absolute left-1/2 top-1/2 transition-all duration-300",
                      pressed ? "translate-x-1 translate-y-2" : "translate-x-3 translate-y-5",
                    ].join(" ")}
                  >
                    <HandIcon fill="#b8480f" background="white" className="size-10" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
