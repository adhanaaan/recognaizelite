import { isServer } from "src/constants";

const width = isServer ? 100 : window.innerWidth - 32,
  height = isServer ? 100 : window.innerHeight > 720 ? window.innerHeight - 40 : window.innerHeight - 20;

const xFactor = width / 350,
  yFactor = height / 700;

export const getPositions = () => {
  return [
    { x: 150, y: 410 }, // 1
    { x: 210, y: 310 },
    { x: 300, y: 340 }, // 2
    { x: 265, y: 430 },
    { x: 180, y: 520 }, // 3
    { x: 280, y: 540 },
    { x: 275, y: 625 }, // 4
    { x: 100, y: 610 },
    { x: 40, y: 520 }, // 5
    { x: 25, y: 410 },
    { x: 15, y: 190 }, // 6
    { x: 100, y: 310 },
    { x: 140, y: 210 }, // 7
    { x: 25, y: 40 },
    { x: 130, y: 110 }, // 8
    { x: 200, y: 30 },
    { x: 290, y: 60 }, // 9
    { x: 220, y: 160 },
    { x: 310, y: 150 }, // 10
    { x: 280, y: 240 },
  ].map((z) => ({ top: z.y * yFactor, left: z.x * xFactor }));
};

export const DemoPoints = [
  { x: 30, y: 320 },
  { x: 60, y: 480 },
  { x: 240, y: 160 },
  { x: 200, y: 340 },
].map((z) => ({ top: z.y * yFactor, left: z.x * xFactor }));
