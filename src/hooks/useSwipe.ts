import { useEffect } from "react";

export type Direction = "up" | "down" | "left" | "right";

export function useSwipe(cb: (x: Direction) => void) {
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isMouseDown = false;

    function handleGesure() {
      const h_dist = touchEndX - touchStartX,
        v_dist = touchEndY - touchStartY;

      if (h_dist == v_dist || Math.max(Math.abs(h_dist), Math.abs(v_dist)) < 50) {
        return;
      } else if (Math.abs(h_dist) > Math.abs(v_dist)) {
        if (h_dist > 0) cb("right");
        else cb("left");
      } else {
        if (v_dist > 0) cb("down");
        else cb("up");
      }
    }

    function touchStart(e: TouchEvent) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }

    function touchEnd(e: TouchEvent) {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleGesure();
    }

    function mouseDown(e: MouseEvent) {
      isMouseDown = true;
      touchStartX = e.screenX;
      touchStartY = e.screenY;
    }

    function mouseMove(e: MouseEvent) {
      if (!isMouseDown) return;
      touchEndX = e.screenX;
      touchEndY = e.screenY;
    }

    function mouseUp(e: MouseEvent) {
      if (!isMouseDown) return;
      isMouseDown = false;
      touchEndX = e.screenX;
      touchEndY = e.screenY;
      handleGesure();
    }

    // Touch events
    document.addEventListener("touchstart", touchStart, false);
    document.addEventListener("touchend", touchEnd, false);

    // Mouse events
    document.addEventListener("mousedown", mouseDown, false);
    document.addEventListener("mousemove", mouseMove, false);
    document.addEventListener("mouseup", mouseUp, false);

    return () => {
      document.removeEventListener("touchstart", touchStart);
      document.removeEventListener("touchend", touchEnd);
      document.removeEventListener("mousedown", mouseDown);
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    };
  }, [cb]);
}
