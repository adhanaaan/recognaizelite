import { createPortal } from "react-dom";
import { DemoElement } from "src/types";
import { DemoArrow } from "./DemoArrow";
import { DemoCard } from "./DemoCard";

export interface DemoInstructionProps extends Partial<DemoElement> {
  top?: number;
  left?: number;
  flip?: boolean;

  showActions?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function DemoInstruction({
  top,
  left,
  flip,
  style,
  arrow = true,
  arrowStyle,
  showActions = true,
  onNext,
  onPrevious,
  instruction,
  instructionClassName,
  showNextBtn,
  texts,
  showPreviousBtn,
}: DemoInstructionProps) {
  return createPortal(
    <div
      className="fixed z-[999] text-white"
      style={{ top, transform: flip ? "translate(-50%, -100%)" : "translate(-50%, 0)", left, ...style }}
    >
      {arrow && !flip && <DemoArrow className="mx-auto my-3" style={arrowStyle} />}

      <DemoCard
        texts={texts}
        instruction={instruction}
        instructionClassName={instructionClassName}
        showActions={showActions}
        onNext={onNext}
        onPrevious={onPrevious}
        showNextBtn={showNextBtn}
        showPreviousBtn={showPreviousBtn}
      />

      {arrow && flip && <DemoArrow className="mx-auto my-3 rotate-180" style={arrowStyle} />}
    </div>,
    document.getElementById("__next")!
  );
}
