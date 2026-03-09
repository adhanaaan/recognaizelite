import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BluePlaneIcon from "src/assets/blue-plane.svg";
import OrangePlaneIcon from "src/assets/orange-plane.svg";
import { ResultOverlay } from "src/components/ResultOverlay";
import { useResult } from "src/hooks/useResult";
import { type Direction } from "src/hooks/useSwipe";
import { t } from "src/lib/translations";
import { demoNextStep, isDemoPage } from "src/utils/helpers";
import { twJoin } from "tailwind-merge";
import { ROTATIONS, getStyles } from "./plane-styles";
import { getRand } from "./utils";

interface Props extends React.PropsWithChildren {
  onSuccess: () => void;
  onError: () => void;
  planes: number;
  gameLevel: number;
}

function ArrowIcon({ direction }: { direction: Direction }) {
  const rotate = { up: "0", right: "90", down: "180", left: "270" }[direction];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotate}deg)` }}
      className="size-10 sm:size-12"
    >
      <path d="M12 4L12 20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const Task4Game: React.FC<Props> = ({ onSuccess, onError, planes, gameLevel, children }) => {
  const [refreshKey, setRefreshKey] = useState(1);
  const { result, setResult, resetResult } = useResult();
  const isProcessing = useRef(false);
  const currentTarget = useRef({ rotation: "" });

  const { seed, target } = useMemo(() => getRand(planes, gameLevel), [planes, gameLevel, refreshKey]);
  const { styles, animations, rotates } = useMemo(() => getStyles(planes, gameLevel), [planes, gameLevel, refreshKey]);

  useEffect(() => {
    currentTarget.current.rotation = rotates[target];
  }, [target, rotates]);

  const handleDirection = useCallback((dir: Direction) => {
    if (isProcessing.current) return;
    if (result) return;

    if (isDemoPage()) {
      if (!window.demoInteractive) return;
      else demoNextStep();
    }

    isProcessing.current = true;
    const dirIdx = ["right", "left", "down", "up"].indexOf(dir);

    if (ROTATIONS[dirIdx] === currentTarget.current.rotation) setResult("success");
    else setResult("error");
  }, [result, setResult]);

  useEffect(() => {
    if (!result) return;

    const timeout = setTimeout(() => {
      if (result === "success") onSuccess();
      else if (result === "error") onError();

      resetResult();
      isProcessing.current = false;
    }, 300);

    return () => clearTimeout(timeout);
  }, [result, onSuccess, onError, resetResult]);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="h-full fc section-padding overflow-hidden"
      style={{
        background:
          "radial-gradient(108.21% 50% at 50% 50%, rgba(175, 205, 250, 0.4) 0%, rgba(61, 136, 253, 0.4) 100%), #FFFFFF",
      }}
    >
      <ResultOverlay result={result} />

      <div className="space-y-4 mb-2.5">
        {children}

        <h2
          id="ag-game-type"
          className="mx-auto w-fit"
          style={{ color: seed ? "#006D85" : "#C95101", fontSize: "32px", lineHeight: "48px" }}
        >
          {seed ? t.AG["Blue"] : t.AG["Orange"]}
        </h2>
      </div>

      <div className="c grow r">
        <div
          id="ag-fly-area"
          className="w-full overflow-hidden r"
          style={{ height: isDemoPage() ? 520 : "100%", width: "100vw", marginInline: "-24px" }}
        >
          {[...Array(planes)].map((_, idx) => {
            const isTarget = idx === target;
            const icons = [OrangePlaneIcon, BluePlaneIcon];
            if (seed) icons.reverse();
            const Icon = isTarget ? icons[0] : icons[1];

            return (
              <Icon
                id={isTarget ? "ag-target-plane" : undefined}
                key={refreshKey * 100 + idx}
                style={styles[idx]}
                onAnimationEnd={isTarget ? () => setRefreshKey(refreshKey + 1) : undefined}
                className={twJoin(
                  "absolute size-10 sm:size-14",
                  animations[idx],
                  rotates[idx],
                  isTarget ? "!z-20" : ""
                )}
              />
            );
          })}
        </div>

        {/* Directional arrow pad — overlaid on fly area */}
        <div className={twJoin(
          "absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 sm:gap-1.5 z-30",
          isDemoPage() && "z-[999]"
        )}>
          <button
            id="ag-button-up"
            onPointerDown={() => handleDirection("up")}
            className="flex items-center justify-center size-[120px] sm:size-[144px] rounded-full bg-[#006D85]/60 text-white active:scale-95 transition-transform select-none shrink-0"
            aria-label="Up"
          >
            <ArrowIcon direction="up" />
          </button>
          <div className="flex gap-9 sm:gap-[45px] items-center shrink-0">
            <button
              id="ag-button-left"
              onPointerDown={() => handleDirection("left")}
              className="flex items-center justify-center size-[120px] sm:size-[144px] rounded-full bg-[#006D85]/60 text-white active:scale-95 transition-transform select-none shrink-0"
              aria-label="Left"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              id="ag-button-right"
              onPointerDown={() => handleDirection("right")}
              className="flex items-center justify-center size-[120px] sm:size-[144px] rounded-full bg-[#006D85]/60 text-white active:scale-95 transition-transform select-none shrink-0"
              aria-label="Right"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
          <button
            id="ag-button-down"
            onPointerDown={() => handleDirection("down")}
            className="flex items-center justify-center size-[120px] sm:size-[144px] rounded-full bg-[#006D85]/60 text-white active:scale-95 transition-transform select-none shrink-0"
            aria-label="Down"
          >
            <ArrowIcon direction="down" />
          </button>
        </div>
      </div>
    </div>
  );
};
