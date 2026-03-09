import { getRandomNum } from "src/utils/random";

export function getShoppingListGroups(shoppingListSize: number) {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .sort(() => Math.random() - 0.5)
    .slice(0, shoppingListSize)
    .map((x) => [1, 2, 3, 4].map((y) => `/images/task-5/game-1/level-1&2/group-${x}/image (${y}).png`));
}

export function getShoppingListDistractors(distractors: number) {
  if (distractors === 5) {
    return [1, 2, 3, 4]
      .sort(() => Math.random() - 0.5)
      .map((x) => [1, 2, 3, 4, 5].map((y) => `/images/task-5/game-1/level-3/group-${x}/image (${y}).png`));
  } else {
    return [1, 2, 3, 4]
      .sort(() => Math.random() - 0.5)
      .map((x) => [1, 2, 3, 4, 5, 6].map((y) => `/images/task-5/game-1/level-4/group-${x}/image (${y}).png`));
  }
}

export function transposeDistractors(group: string[][]) {
  const newGroup = [];

  for (let j = 0; j < group[0].length; j++) {
    const t = [];
    for (let i = 0; i < group.length; i++) {
      t.push(group[i][j]);
    }

    newGroup.push(t);
  }

  return newGroup;
}

export function getShoppingList(shoppingListSize: number, distractors = 0) {
  const group = distractors ? getShoppingListDistractors(distractors) : getShoppingListGroups(shoppingListSize);

  return {
    shoppingList: group.map((x) => x[getRandomNum(x.length)]).sort(() => Math.random() - 0.5),
    shoppingListGroup: distractors ? transposeDistractors(group) : group,
  };
}
