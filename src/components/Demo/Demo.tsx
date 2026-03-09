import { Fragment, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { DemoElement } from "src/types";
import { DemoComplete } from "./DemoComplete";
import { useDemoContext } from "./DemoContext";
import { DemoHighlight } from "./DemoHighlight";
import { VoiceOver } from "src/components/VoiceOver";
import { twJoin } from "tailwind-merge";

function getStyles(show: boolean, elements?: DemoElement[]) {
  if (!show || !elements) return [];

  return elements
    .map((x) => ({ node: document.getElementById(x.id)!, ...x }))
    .filter((x) => !!x.node)
    .map(({ node, ...x }) => {
      const c = node.getBoundingClientRect();

      return { ...x, style: { height: c.height, width: c.width, left: c.x, top: c.y, ...x.style } as any };
    });
}

export function Demo() {
  const {
    data: { steps },
    state: { currentStep, previousStep, step, hasMounted },
    actions: { setHasMounted, moveToNextStep, moveToPreviousStep },
  } = useDemoContext();

  const { interactive, delay, elements, voiceover, hideOverlay, demoNextEvent = "demo-next" } = step ?? {};

  const nodes = useMemo(() => getStyles(hasMounted, elements), [hasMounted, currentStep]);

  useEffect(() => {
    if (currentStep <= previousStep) {
      setHasMounted(true);
      return;
    }
    const timeout = setTimeout(() => setHasMounted(true), delay);
    return () => clearTimeout(timeout);
  }, [currentStep]);

  // Show overlay if there are elements to highlight, unless hideOverlay is explicitly set
  const showOverlay = hideOverlay === undefined ? nodes.length : !hideOverlay;
  // If interactive is true or there is no overlay (no elements or hideOverlay is true)
  const isTriggered = interactive || !showOverlay;
  const isDemoCompleted = currentStep === steps.length;

  useEffect(() => {
    if (!step || !hasMounted || !isTriggered) return;

    window.demoInteractive = true;
    window.demoCurrentStep = currentStep;
    window.addEventListener(demoNextEvent, moveToNextStep);
    return () => {
      window.demoInteractive = undefined;
      window.demoCurrentStep = undefined;
      window.removeEventListener(demoNextEvent, moveToNextStep);
    };
  }, [nodes, currentStep]);

  if (typeof document === "undefined") return null;

  return createPortal(
    isDemoCompleted ? (
      <DemoComplete />
    ) : (
      <Fragment>
        {voiceover && <VoiceOver key={`${currentStep}:${voiceover}`} source={voiceover} />}
        <div
          className={twJoin(
            "fixed inset-0 z-[998] w-full h-full mix-blend-hard-light bg-black/75",
            isTriggered && "pointer-events-none"
          )}
          style={{ display: showOverlay ? undefined : "none" }}
        >
          {nodes.map((x, idx) => (
            <DemoHighlight
              key={idx}
              onNext={moveToNextStep}
              onPrevious={currentStep === 0 ? undefined : moveToPreviousStep}
              showActions={!isTriggered}
              {...x}
            />
          ))}
        </div>
      </Fragment>
    ),
    document.getElementById("__next")!
  );
}
