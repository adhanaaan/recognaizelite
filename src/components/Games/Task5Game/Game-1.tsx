import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DemoIndicator } from "src/components/Demo/DemoIndicator";
import { LivesTracker } from "src/components/LivesTracker";
import { ProgressBar } from "src/components/ProgressBar";
import { task5 } from "src/constants/tasks";
import { useDemoReset } from "src/hooks/useDemoReset";
import { TimeRemainingCard } from "src/NewComponents/TimeRemainingCard";
import { diffTime, getTimeLap, isDemoPage } from "src/utils/helpers";
import { Conveyor } from "./Conveyor";
import { ShoppingList } from "./ShoppingList";
import { getShoppingList } from "./utils";

interface props {
  time: number;
  retries: number;
  onSuccess: (x: any) => void;
  onError: (x: any) => void;
  shoppingListSize: number;
  distractors?: number;
}

export const Game1: React.FC<props> = ({ onSuccess, onError, retries, distractors, time, shoppingListSize }) => {
  const [lives, setLives] = useState(retries);
  const [key, setKey] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [pickedItems, setPickedItems] = useState<boolean[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const lap = useCallback(getTimeLap(), [shoppingListSize, distractors]);
  const steps = useRef([] as any[]);

  const { shoppingList, shoppingListGroup } = useMemo(
    () => getShoppingList(shoppingListSize, distractors),
    [shoppingListSize, distractors]
  );

  const start = useRef(0);
  const droppedItems = useRef(0);
  const progress = pickedItems.filter((x) => x).length;

  function loose() {
    if (isDemoPage()) return;

    if (lives === 1)
      onError({
        steps: steps.current,
        time: diffTime(start.current) + "s",
        correct: progress,
        errors: retries,
      });
    setLives(lives - 1);
  }

  function startGame() {
    if (gameStarted) return;

    start.current = new Date().getTime();
    setGameStarted(true);
  }

  useEffect(() => {
    if (progress === shoppingListSize)
      onSuccess({
        steps: steps.current,
        time: diffTime(start.current) + "s",
        correct: progress,
        errors: retries - lives,
      });
  }, [pickedItems]);

  useDemoReset(() => {
    setLives(retries);
    setPickedItems([]);
    steps.current = [];
    droppedItems.current = 0;
    setKey((k) => k + 1);
  });

  return (
    <div
      key={key}
      className="justify-end fc full r"
      style={{
        background:
          "radial-gradient(108.21% 50% at 50% 50%, rgba(242, 211, 191, 0.4) 0%, rgba(254, 142, 68, 0.4) 100%), #FFFFFF",
      }}
    >
      <div className="px-6 md:px-12">
        <ShoppingList
          gameStarted={gameStarted}
          shoppingList={shoppingList}
          pickedItems={pickedItems}
          startGame={startGame}
          onOpenChange={setListOpen}
        />

        <div id="gs-game-details" className="space-y-4">
          <div className="justify-between f">
            <LivesTracker lives={retries} avlLives={lives} />
            {isDemoPage() ? (
              <DemoIndicator />
            ) : (
              <TimeRemainingCard
                time={time}
                callback={() =>
                  onSuccess({
                    steps: steps.current,
                    time: diffTime(start.current) + "s",
                    correct: progress,
                    errors: retries - lives,
                  })
                }
                showSeconds={false}
              />
            )}
          </div>
          <div className="items-center gap-2 f">
            <div className="font-bold">
              {progress}/{shoppingListSize}
            </div>
            <div className="h-3 overflow-hidden bg-white rounded-full grow">
              <ProgressBar progress={(progress * 100) / shoppingListSize} color={task5.color} backgroundColor="white" />
            </div>
          </div>
        </div>
      </div>

      <Conveyor
        shoppingListGroup={gameStarted ? shoppingListGroup : []}
        listOpen={listOpen}
        onItemDrop={(x) => {
          if (shoppingList.includes(x)) {
            droppedItems.current++;
            return true;
          }
          return false;
        }}
        onItemClick={(x) => {
          const i = shoppingList.findIndex((y) => y === x);
          if (i === -1) {
            loose();
            steps.current.push({
              time: lap(),
              success: "No",
            });

            return false;
          } else {
            pickedItems[i] = true;
            setPickedItems([...pickedItems]);
            steps.current.push({
              time: lap(),
              success: "Yes",
            });

            return true;
          }
        }}
      />
    </div>
  );
};
