import React from "react";
import { isDemoPage } from "src/utils/helpers";

export const useCountDown = (initialValue = 10, cb?: () => void, disabled = false) => {
  const [countDown, setCountDown] = React.useState(initialValue);

  React.useEffect(() => {
    if (disabled || isDemoPage()) return;

    const countDownrId = setTimeout(() => {
      if (countDown <= 1) {
        cb?.();
      } else {
        setCountDown(countDown - 1);
      }
    }, 1000);

    return () => clearInterval(countDownrId);
  }, [disabled, countDown]);

  return { countDown };
};
