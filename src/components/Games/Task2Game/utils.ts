import { randomNumbersArr } from "src/utils/random";

export const IconList = [
  "sun.png",
  "camera.png",
  "flash.png",
  "lock.png",
  "moon.png",
  "next.png",
  "puzzle.png",
  "setting.png",
  "star.png",
  "mail.png",
].sort(() => Math.random() - 0.5);

let skipShuffle = true;

export function genRandomIconList(tiles: number) {
  if (skipShuffle) {
    skipShuffle = false;
    return [...Array(tiles)].map((_, idx) => idx);
  }

  return randomNumbersArr(tiles, tiles - 1);
}

export function resetSkipShuffle() {
  skipShuffle = true;
}
