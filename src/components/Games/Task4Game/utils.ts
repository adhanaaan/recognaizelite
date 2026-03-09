import { isDemoPage } from "src/utils/helpers";
import { getRandomNum } from "src/utils/random";

export function getRand(planes: number, gameLevel: number) {
  if (isDemoPage())
    switch (gameLevel) {
      case 0: {
        return { seed: true, target: 0 };
      }
      case 1: {
        return { seed: false, target: 0 };
      }
      case 2: {
        return { seed: false, target: 1 };
      }
      case 3: {
        return { seed: true, target: 2 };
      }
    }

  return { seed: Math.random() > 0.5, target: getRandomNum(planes) };
}
