import Router from "next/router";
import { createPortal } from "react-dom";
import { t } from "src/lib/translations";
import { DemoCard } from "./DemoCard";
import { useDemoContext } from "./DemoContext";
import { VoiceOver } from "src/components/VoiceOver";

export function DemoComplete() {
  const {
    actions: { moveToPreviousStep },
  } = useDemoContext();

  return createPortal(
    <div className="absolute inset-0 cc gap-y-8 z-[998] bg-black/75 font-medium">
      <VoiceOver key="demo-complete" source="GEN_1.mp3" />
      <DemoCard
        instruction={t.GAME_SPECIFIC["Great!\nNow it’s time to take the actual test."]}
        onNext={() => Router.replace("game")}
        onPrevious={() => {
          moveToPreviousStep();
          window.dispatchEvent(new Event("demo.reset"));
        }}
        texts={{
          next: t.GAME_SPECIFIC["Start test"],
          previous: t.GAME_SPECIFIC["Try again"],
        }}
      />
    </div>,
    document.getElementById("__next")!
  );
}
