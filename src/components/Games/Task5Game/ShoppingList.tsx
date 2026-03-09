import { useEffect, useState } from "react";
import Image from "next/image";
import { useDemoContextOptional } from "src/components/Demo/DemoContext";
import { t } from "src/lib/translations";
import { Button } from "src/NewComponents/Button";
import { TimeRemainingCard } from "src/NewComponents/TimeRemainingCard";
import { twJoin } from "tailwind-merge";

interface Props {
  gameStarted: boolean;
  startGame: () => void;
  shoppingList: string[];
  pickedItems: boolean[];
  onOpenChange?: (open: boolean) => void;
}

function getHeight() {
  if (typeof window === "undefined") return 400;
  const { innerHeight } = window;
  if (innerHeight < 720) return 380 - (670 - innerHeight);
  else if (innerHeight < 820) return 440 - (770 - innerHeight);
  else return innerHeight - 300;
}

export function ShoppingList({ gameStarted, startGame, shoppingList, pickedItems, onOpenChange }: Props) {
  const [showShoppingList, setShowShoppingList] = useState(false);
  const show = !gameStarted || showShoppingList;

  function toggleList(next: boolean) {
    setShowShoppingList(next);
    onOpenChange?.(next);
  }
  const demoContext = useDemoContextOptional();
  const height =
    getHeight() +
    (shoppingList.length > 4 ? 0 : 0) -
    (gameStarted ? 0 : 80) -
    (demoContext?.state.currentStep === 4 ? 100 : 0);

  useEffect(() => {
    window.addEventListener("demo.next.1", startGame);
    return () => window.removeEventListener("demo.next.1", startGame);
  }, [startGame]);

  let content = <></>;
  if (show) {
    content = (
      <>
        {!gameStarted && (
          <div id="gs-shopping-list-timer" className="ml-auto w-fit">
            <TimeRemainingCard disabled={gameStarted} time={10} callback={startGame} showSeconds={false} />
          </div>
        )}

        {!gameStarted && (
          <div id="gs-shopping-list-text" className="space-y-2 text-center leading-match">
            <h3 className="font-extrabold" style={{ lineHeight: "24px" }}>
              {t.GS["Shopping List"]}
            </h3>

            <p className="font-medium leading-4 text-zinc-500">
              {t.GS["Remember these items.\nYou can refer back to this list later"]}
            </p>
          </div>
        )}

        <div id="gs-shopping-list-items" className="c">
          <div
            className="grid items-center flex-1 grid-cols-2 transition-opacity duration-500"
            style={{
              height,
              maxHeight: show ? height : 0,
              opacity: show ? 1 : 0,
            }}
          >
            {show &&
              shoppingList.map((x, idx) => (
                <div
                  key={idx}
                  className="relative odd:last:col-span-2"
                  style={{
                    opacity: pickedItems[idx] ? 0.5 : 1,
                  }}
                >
                  <Image
                    className="mx-auto w-28 object-contain"
                    style={typeof window !== "undefined" && window.innerWidth >= 1024 ? { width: 132, height: 131 } : undefined}
                    src={x}
                    alt={`Shopping item ${idx + 1}`}
                    width={132}
                    height={131}
                  />
                </div>
              ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      id="gs-shopping-list"
      className={twJoin(
        "absolute inset-x-0 top-0 z-10 mx-6 md:mx-12 lg:w-[809px] lg:mx-auto zig-zag transition-all",
        show ? "" : "animate-shopping-list"
      )}
      style={{
        background: "linear-gradient(180deg, #FDFDFD 0%, #DBDBDB 100%)",
      }}
    >
      <div className="h-full gap-8 px-12 py-8 mb-5 fc lg:gap-[24px]">
        {content}

        {gameStarted ? (
          <div className="px-12 pb-12 -mx-12 -mb-12" onClick={() => toggleList(!showShoppingList)}>
            <h3 className="mb-2 text-center" style={{ lineHeight: "24px" }}>
              {t.GS["Shopping List"]}
            </h3>
            <div
              id="gs-shopping-list-arrow"
              className={["size-[30px] mx-auto c", showShoppingList ? "rotate-180" : ""].join(" ")}
            >
              <svg viewBox="0 0 31 24" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_2411_5338)">
                  <path d="M16 20L3.00962 5L28.9904 5L16 20Z" fill="url(#paint0_linear_2411_5338)" />
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear_2411_5338"
                    x1="16"
                    y1="5.96007e-07"
                    x2="16"
                    y2="20"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#E89660" />
                    <stop offset="1" stopColor="#C95101" />
                  </linearGradient>
                  <clipPath id="clip0_2411_5338">
                    <rect width="31" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
        ) : (
          <Button btn="task5" className="w-full h-[52px]" onClick={startGame}>
            Ready
          </Button>
        )}
      </div>
    </div>
  );
}
