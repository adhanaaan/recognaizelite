import { useEffect } from "react";
import { isAct4HealthMode } from "src/utils/assessment";
import { vibrate } from "src/utils/helpers";
import { NumberButton } from "./NumberButton";
import { unlockAudioOnce } from "src/lib/audio-unlock";

interface Props {
  isTour?: boolean;
  onTourComplete?: () => void;
  activeElement: number;
  randomList: number[];
  desktopDemo?: boolean;
  setResult: any;
}

export function NumberPad({ isTour, randomList, activeElement, onTourComplete, setResult, desktopDemo = false }: Props) {
  const act4health = isAct4HealthMode();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key;
      if (key < "0" || key > "9") return;
      const idx = parseInt(key, 10);
      document.getElementById(`sb-number-pad-${idx}`)?.click();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      id="sb-number-pad"
      className={[
        "c-shadow",
        desktopDemo
          ? "w-[411.66px] h-[459px] rounded-[48.15px] border-[1.2px] border-white/50 px-[52.96px] py-[28.89px]"
          : "px-5 py-2 tall:py-3 w-full tall-lg:py-5 mx-auto rounded-[40px]",
      ].join(" ")}
      style={{
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.435111) 50.99%, rgba(255, 255, 255, 0.415625) 87.11%, rgba(255, 255, 255, 0.0510417) 132.43%, rgba(255, 255, 255, 0) 147.3%)",
      }}
    >
      <div
        className={
          desktopDemo
            ? "grid w-[296.10px] h-[401.22px] content-start items-start justify-items-center grid-cols-3 gap-[19.26px]"
            // Wider gap to match Act4Health's larger buttons (see
            // NumberButton) — bigger targets crowded together would be as
            // hard to hit accurately as the small ones they're replacing.
            : act4health
              ? "grid flex-wrap items-start grid-cols-3 gap-4 tall:gap-5 mx-auto w-fit"
              : "grid flex-wrap items-start grid-cols-3 gap-2 tall:gap-3 mx-auto w-fit"
        }
      >
        {[...Array(10)].map((_, idx) => {
          idx = (idx + 1) % 10;
          const active = randomList[idx] === activeElement;

          return (
            <NumberButton
              key={idx}
              id={`sb-number-pad-${idx}`}
              desktopDemo={desktopDemo}
              className={isTour ? (active ? "active-circle-3" : "pointer-events-none") : ""}
              onClick={() => {
                unlockAudioOnce();
                if (isTour) {
                  if (active) onTourComplete?.();
                  return true;
                }

                if (active) {
                  setResult("success");
                  return true;
                } else {
                  vibrate();
                  setResult("error");
                  return false;
                }
              }}
            >
              {idx}
            </NumberButton>
          );
        })}
      </div>
    </div>
  );
}
