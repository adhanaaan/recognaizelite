export const task1Levels = [{}];

export const task2Levels = [{ tiles: 10, time: 60 }];

export const task3Levels = [{ points: 20, time: 180 }];

export const task4Levels = [
  {
    time: 60,
    lives: 3,
    planes: [
      // 1-5
      1, 1, 3, 3, 3,
      // 6-10
      4, 4, 4, 4, 4,
      // 11-15
      5, 5, 5, 5, 5,
      // 16-20
      6, 6, 6, 6, 6,
      // 21-25
      7, 7, 7, 7, 7,
      // 26-30
      8, 8, 8, 8, 8,
    ],
  },
];

export const task5Levels = [
  { shoppingListSize: 4, time: 60, retries: 3 },
  { shoppingListSize: 6, time: 60, retries: 3 },
  {
    shoppingListSize: 4,
    distractors: 5,
    time: 60,
    retries: 3,
  },
  {
    shoppingListSize: 5,
    distractors: 6,
    time: 60,
    retries: 3,
  },
  {
    budget: 10,
  },
  {
    budget: 50,
  },
];
