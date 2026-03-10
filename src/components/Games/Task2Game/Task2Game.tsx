import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { ResultOverlay } from "src/components/ResultOverlay";
import { useDemoReset } from "src/hooks/useDemoReset";
import { useResult } from "src/hooks/useResult";
import { isDemoPage } from "src/utils/helpers";
import { NumberPad } from "./NumberPad";
import { ReferenceIcons } from "./ReferenceIcons";
import { IconList, genRandomIconList } from "./utils";

export const Task2Game: React.FC<{
  tiles: number;
  isTour?: boolean;
  desktopDemo?: boolean;
  onTourComplete?: () => void;
  onSuccess: () => void;
  onError: () => void;
  [x: string]: any;
}> = ({ tiles, onSuccess, onError, isTour, onTourComplete, desktopDemo = false, children }) => {
  const [refreshKey, updateRefreshKey] = useState(1);
  const [activeEle, setActiveEle] = useState(7);
  const { result, setResult, resetResult } = useResult();
  const showDesktopDemoLayout = desktopDemo;

  const randomList = useMemo(() => genRandomIconList(tiles), [tiles, refreshKey]);

  useDemoReset(() => {
    resetResult();
    updateRefreshKey(refreshKey * -1);
  });

  useEffect(() => {
    if (!result) return;

    const timeout = setTimeout(() => {
      resetResult();

      if (result === "success") onSuccess();
      else {
        onError();

        // For demo page
        if (isDemoPage()) {
          return;
        }
      }

      const nextEle = Math.round(Math.random() * (tiles - 1));
      setActiveEle(nextEle === activeEle ? (nextEle + tiles - 1) % tiles : nextEle);
      updateRefreshKey(refreshKey * -1);
    }, 250);
    return () => clearInterval(timeout);
  }, [result]);

  if (showDesktopDemoLayout) {
    return (
      <div
        className="w-full h-dvh overflow-hidden flex items-center justify-center"
        style={{ background: "radial-gradient(#E4E3FF78, #D68DE878)" }}
      >
        <div
          className="fc items-center justify-start"
          style={{
            width: 1280,
            height: 832,
            transform: "scale(min(calc(100vw / 1280), calc(100dvh / 832)))",
            transformOrigin: "center center",
            padding: "48px 62px 146px",
          }}
        >
          <ResultOverlay result={result} />

          {children}

          <div className="w-[976.86px] mt-[48px] f items-end gap-[55px]">
            <div className="fc items-center">
              <div
                id="sb-main-icon"
                className={[
                  "relative w-[248px] h-[199px] mb-[56px]",
                  result === "success" ? "text-emerald-500" : result === "error" ? "text-red-500" : "",
                ].join(" ")}
                style={{ background: "radial-gradient(circle 120px, white, transparent)" }}
              >
                <AnimatePresence>
                  <motion.img
                    key={activeEle * 100 + refreshKey}
                    initial={{ left: 250, height: "25%", width: "25%" }}
                    animate={{ left: 0, height: "auto", width: "auto" }}
                    exit={{ left: -200, height: "25%", width: "25%" }}
                    className="absolute inset-y-0 my-auto inset-x-0 mx-auto w-[199.21px] h-[199.21px] animate-shake"
                    src={`/images/task-2/${IconList[activeEle]}`}
                  />
                </AnimatePresence>
              </div>

              <ReferenceIcons randomList={randomList} desktopDemo />
            </div>

            <NumberPad
              randomList={randomList}
              activeElement={activeEle}
              isTour={isTour}
              onTourComplete={onTourComplete}
              setResult={setResult}
              desktopDemo
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="items-center max-h-dvh h-full fc px-6 py-3 justify-between gap-1"
      style={{ background: "radial-gradient(#E4E3FF78, #D68DE878)" }}
    >
      <ResultOverlay result={result} />

      {children}

      <div
        id="sb-main-icon"
        className={[
          "relative shrink min-h-0 aspect-square w-20 md:scale-125 lg:scale-150",
          result === "success" ? "text-emerald-500" : result === "error" ? "text-red-500" : "",
        ].join(" ")}
        style={{ background: "radial-gradient(circle 60px, white, transparent)" }}
      >
        <AnimatePresence>
          <motion.img
            key={activeEle * 100 + refreshKey}
            initial={{ left: 250, height: "25%", width: "25%" }}
            animate={{ left: 0, height: "auto", width: "auto" }}
            exit={{ left: -200, height: "25%", width: "25%" }}
            className="absolute inset-y-0 my-auto animate-shake"
            src={`/images/task-2/${IconList[activeEle]}`}
          />
        </AnimatePresence>
      </div>

      <ReferenceIcons randomList={randomList} />

      <NumberPad
        randomList={randomList}
        activeElement={activeEle}
        isTour={isTour}
        onTourComplete={onTourComplete}
        setResult={setResult}
      />
    </div>
  );
};
