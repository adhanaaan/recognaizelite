import { useEffect, useRef } from "react";

export function useDemoReset(onReset: () => void, resetEventName = "demo.reset") {
  const callbackRef = useRef(onReset);
  callbackRef.current = onReset;

  useEffect(() => {
    const fn = () => callbackRef.current();

    window.addEventListener(resetEventName, fn);
    return () => window.removeEventListener(resetEventName, fn);
  }, []);
}
