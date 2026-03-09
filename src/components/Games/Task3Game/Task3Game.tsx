import React, { memo, useEffect, useRef, useState } from "react";
import { useDemoReset } from "src/hooks/useDemoReset";
import { demoNextStep } from "src/utils/helpers";
import { unlockAudioOnce } from "src/lib/audio-unlock";
import { Background } from "./Background";
import { ConnectingLine } from "./ConnectingLine";
import { FilledCircle } from "./FilledCircle";
import { NumberButton } from "./Number";

interface props extends React.PropsWithChildren {
  onSuccess: () => void;
  onComplete: () => void;
  onError: () => void;
  points: number;
  positions: { top: number; left: number }[];
}

export const Task3Game: React.FC<props> = memo(({ onSuccess, onError, points, onComplete, children, positions }) => {
  const [lines, setLines] = useState([] as any[]);
  const [prevPoint, setPrevPoint] = useState(-1);
  const prevPointRef = useRef(-1);

  useDemoReset(() => {
    setLines(lines.slice(0, 3));
    setPrevPoint(3);
    prevPointRef.current = 3;
  });

  useEffect(() => {
    if (prevPoint < points - 1) return;

    onComplete();
  }, [prevPoint, points, onComplete]);

  return (
    <Background>
      {children}
      <div className="absolute inset-0 top-5 tall:top-10">
        {positions.slice(0, points).map(({ top, left }, idx) => (
          <button
            key={idx}
            id={`tm-element-${idx + 1}`}
            className="absolute z-20 rounded-full shadow-md md:scale-150 bg-white lg:scale-[1.75]"
            style={
              {
                left,
                top,
                "--gradient-start": "#5BCFAC",
                "--gradient-end": "#02865E",
                "--text-color": "#3A3A3A",
                "--number-bg": "white",
              } as React.CSSProperties
            }
            onClick={(e) => {
              unlockAudioOnce();
              const currentPrevPoint = prevPointRef.current;

              if (idx !== currentPrevPoint + 1) {
                onError();

                const currentTarget = e.currentTarget;
                currentTarget.style.setProperty("--gradient-start", "#CF5B5B");
                currentTarget.style.setProperty("--gradient-end", "#860202");
                currentTarget.style.setProperty("--text-color", "#FC0303");
                currentTarget.style.setProperty("--number-bg", "#FDEDED");

                setTimeout(() => {
                  currentTarget.style.setProperty("--gradient-start", "#5BCFAC");
                  currentTarget.style.setProperty("--gradient-end", "#02865E");
                  currentTarget.style.setProperty("--text-color", "#3A3A3A");
                  currentTarget.style.setProperty("--number-bg", "white");
                }, 300);
                return;
              }

              prevPointRef.current = idx;
              setPrevPoint(idx);

              onSuccess();

              if (currentPrevPoint === -1) return;

              setLines((z) => [
                ...z,
                {
                  top: positions[currentPrevPoint].top + 26,
                  left: positions[currentPrevPoint].left + 26,
                  bottom: top + 26,
                  right: left + 26,
                },
              ]);

              if (idx === 7) demoNextStep();
            }}
          >
            <span
              style={{
                opacity: idx <= prevPoint ? 0.6 : 1,
              }}
            >
              {idx % 2 ? (
                <FilledCircle percent={(idx + 1) / positions.length} />
              ) : (
                <NumberButton>{(idx + 2) / 2}</NumberButton>
              )}
            </span>
          </button>
        ))}
        {lines.map((props, idx) => (
          <ConnectingLine id={`tm-line-${idx + 1}`} key={idx} {...props} />
        ))}
      </div>
    </Background>
  );
});

Task3Game.displayName = "Task3Game";
