import { isDemoPage } from "src/utils/helpers";
import { getRandomNum, randomElementFromArr } from "src/utils/random";

export const ANIMATIONS = ["animate-from-left", "animate-from-right", "animate-from-top", "animate-from-bottom"];

export const ROTATIONS = ["rotate-90", "-rotate-90", "rotate-180", "rotate-0"];

export function getStyles(planes: number, gameLevel: number) {
  const seed = getRandomNum(planes);
  const isTall = window.innerHeight >= 720;
  const isDesktop = window.innerWidth >= 1024;
  const size = window.innerWidth >= 640 ? 56 : 40;

  const height = isDesktop
    ? window.innerHeight - 130
    : window.innerHeight - (isTall ? 224 : 192);
  const width = window.innerWidth;

  // assumption planes <= Math.min(xFactor, yFactor) * 2
  // expected value of planes < 18
  const xFactor = Math.floor(width / size);
  const yFactor = Math.floor(height / size);

  const offsetX = (width - xFactor * size) / xFactor;
  const offsetY = (height - yFactor * size) / yFactor;

  const lefts = [...Array(xFactor)]
    .map((_, idx) => idx * (size + offsetX))
    .sort(() => Math.random() - 0.5)
    .values();
  const tops = [...Array(yFactor)]
    .map((_, idx) => idx * (size + offsetY))
    .sort(() => Math.random() - 0.5)
    .values();

  const styles = [];
  const animations = [];
  const rotates = [];

  for (let i = 0, j = (i + seed) % 4; i < planes; i++, j = (i + seed) % 4) {
    rotates.push(randomElementFromArr(ROTATIONS));
    animations.push(ANIMATIONS[j]);
    styles.push(j > 1 ? { left: lefts.next().value } : { top: tops.next().value });
  }

  if (isDemoPage()) {
    switch (gameLevel) {
      case 0: {
        rotates[0] = ROTATIONS[3];
        animations[0] = ANIMATIONS[3];
        styles[0] = { left: "40%" };
        break;
      }
      case 1: {
        rotates[0] = ROTATIONS[2];
        animations[0] = ANIMATIONS[2];
        styles[0] = { left: "40%" };
        break;
      }
      case 2: {
        rotates[1] = ROTATIONS[3];
        animations[1] = ANIMATIONS[0];
        styles[1] = { top: "40%" };
        break;
      }
    }
  }

  return { styles, animations, rotates };
}
