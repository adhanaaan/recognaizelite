import { useEffect, useRef, useState } from "react";
import { t } from "src/lib/translations";
import { twMerge } from "tailwind-merge";

export function Score({
  score = 0,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { score: number }) {
  const [bgColor, setBgColor] = useState("");
  const ref = useRef(0);
  const prev = ref.current;

  useEffect(() => {
    if (score === 0) return;

    if (score > prev) setBgColor("text-emerald-500");
    else setBgColor("text-red-500");

    const timeout = setTimeout(setBgColor, 350, "");
    return () => clearTimeout(timeout);
  }, [score]);

  function cl() {
    ref.current = score;
    if (score === 0) return "";

    if (score > prev) return "animate-slide-up";
    else return "animate-slide-down";
  }

  return (
    <div key={score} className={twMerge("text-center f", className, bgColor)} {...props}>
      {t.GAME_SPECIFIC["Score:"]}
      <div className={[cl(), "inline-block ml-2"].join(" ")}>{score}</div>
    </div>
  );
}
