import { IntialProgress } from "src/constants/tasks";

export const calculateCompletedTask = (taskProgress: typeof IntialProgress) => {
  let x = 0;

  for (let i = 2; i <= 5; i++) {
    const { currLevel, totalLevel } = taskProgress[`task${i}` as keyof typeof IntialProgress];

    if (currLevel === totalLevel) x++;
  }

  return x;
};
