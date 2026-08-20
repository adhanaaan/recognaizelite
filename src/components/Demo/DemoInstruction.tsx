import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DemoElement } from "src/types";
import { DemoArrow } from "./DemoArrow";
import { DemoCard } from "./DemoCard";

/** Breathing room kept between the instruction card and the viewport edge. */
const VIEWPORT_MARGIN = 12;

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
  /**
   * `top` anchors the card to the highlighted element — its top edge when the
   * card sits below, its bottom edge (via the -100% translate) when it sits
   * above. Neither case was bounded by the viewport, so a card anchored to an
   * element near an edge rendered partly off-screen with its instruction
   * unreadable — which is what a taller number pad pushing the reference icons
   * upward exposed. Measure the card and pull it back inside.
   *
   * Only the `top` offset is adjusted, never the transform, so the clamp is a
   * no-op whenever the card already fits: nothing moves on the screens that
   * were rendering correctly.
   */
  const cardRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ cardHeight: 0, viewportHeight: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      // Rounded, so a subpixel change can't ping-pong between measure and
      // re-render.
      const cardHeight = Math.round(cardRef.current?.getBoundingClientRect().height ?? 0);
      const viewportHeight = window.innerHeight;
      setBounds((prev) =>
        prev.cardHeight === cardHeight && prev.viewportHeight === viewportHeight
          ? prev
          : { cardHeight, viewportHeight }
      );
    };

    measure();
    // Mobile browsers change innerHeight as the URL bar collapses, which would
    // otherwise leave the clamp based on a stale viewport.
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [instruction, showActions, showNextBtn, showPreviousBtn, top, left]);

  let resolvedTop = top;
  const { cardHeight, viewportHeight } = bounds;
  if (cardHeight > 0 && viewportHeight > 0 && typeof top === "number") {
    const topEdge = flip ? top - cardHeight : top;
    const lowestAllowed = Math.max(VIEWPORT_MARGIN, viewportHeight - cardHeight - VIEWPORT_MARGIN);
    const clampedTopEdge = Math.min(Math.max(topEdge, VIEWPORT_MARGIN), lowestAllowed);
    resolvedTop = flip ? clampedTopEdge + cardHeight : clampedTopEdge;
  }

  return createPortal(
    <div
      ref={cardRef}
      className="fixed z-[999] text-white"
      style={{ top: resolvedTop, transform: flip ? "translate(-50%, -100%)" : "translate(-50%, 0)", left, ...style }}
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
