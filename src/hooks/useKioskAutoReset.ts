import { useEffect, useRef } from "react";

type Options = {
  idleMs: number;
  onIdle: () => void;
  paused?: boolean;
};

export function useKioskAutoReset({ idleMs, onIdle, paused = false }: Options) {
  const callbackRef = useRef(onIdle);
  callbackRef.current = onIdle;

  useEffect(() => {
    if (paused) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const arm = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => callbackRef.current(), idleMs);
    };

    const onActivity = () => arm();
    const onVisibility = () => {
      if (document.visibilityState === "visible") arm();
    };

    arm();
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    window.addEventListener("touchstart", onActivity, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchstart", onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [idleMs, paused]);
}
