import { t } from "src/lib/translations";
import * as GameLevel from "./game-levels";

export const task2 = {
  name: "Symbol Matching",
  title: t.SM["Symbol Matching"],
  seconds: 60,
  color: "#630092",
  instruction: t.SM["Match as many symbols to their numbers  as possible within 1 minute."],
  voiceover: "SM_7.mp3",
  info: "Processing Speed",
  description: t.SM["Processing Speed refers to how quickly your brain can understand and react to information."],
};

export const task3 = {
  name: "Trail Making",
  title: t.TM["Trail Making"],
  seconds: 180,
  color: "#02865E",
  instruction: t.TM["Connect all circles within 3 minutes, alternating between Number and Green Area."],
  voiceover: "TM_8.mp3",
  info: "Executive Function",
  description: t.TM["Executive Function refers to your brain’s ability to plan, solve problems, and stay focused."],
};

export const task4 = {
  name: "Airplane Game",
  title: t.AG["Airplane Game"],
  seconds: 60,
  color: "#006D85",
  instruction: t.AG["Find the plane in the same colour.\nIn this case, find the blue plane."],
  voiceover: "AG_10.mp3",
  info: "Attention",
  description: t.AG["Attention refers to your brain’s ability to to focus while ignoring distractions."],
};

export const task5 = {
  name: "Grocery Shopping",
  title: t.GS["Grocery Shopping"],
  seconds: 180,
  color: "#C95101",
  instruction:
    t.GS["In Rounds 1–4, select the items that’s in shopping list, and in Rounds 5–6, give the exact change."],
  voiceover: "GS_11.mp3",
  info: "Memory",
  description: t.GS["Memory is the ability to store and recall information; working memory holds it temporarily."],
};

export const tasks = [task2, task3, task4, task5];

export const IntialProgress = {
  task1: {
    currLevel: 0,
    totalLevel: GameLevel.task1Levels.length,
  },
  task2: {
    currLevel: 0,
    totalLevel: GameLevel.task2Levels.length,
  },
  task3: {
    currLevel: 0,
    totalLevel: GameLevel.task3Levels.length,
  },
  task4: {
    currLevel: 0,
    totalLevel: GameLevel.task4Levels.length,
  },
  task5: {
    currLevel: 0,
    totalLevel: GameLevel.task5Levels.length,
  },
};

export type TaskProgressType = typeof IntialProgress;
export type TaskProgressKey = keyof typeof IntialProgress;
