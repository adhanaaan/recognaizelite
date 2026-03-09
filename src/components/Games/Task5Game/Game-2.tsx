import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import CorrectCircleIcon from "src/assets/correct-circle.svg";
import WrongCircleIcon from "src/assets/wrong-circle.svg";
import { APP_LANG } from "src/constants";
import { useDemoReset } from "src/hooks/useDemoReset";
import { useResult } from "src/hooks/useResult";
import { t } from "src/lib/translations";
import { Button } from "src/NewComponents/Button";
import { demoNextStep, diffTime, isDemoPage } from "src/utils/helpers";
import { unlockAudioOnce } from "src/lib/audio-unlock";

interface Props {
  onSuccess: () => void;
  onError: () => void;
  budget: number;
}

function emptyCash() {
  return {
    ...Object.fromEntries(HUNDREDS.map((x) => [x, 0])),
    ...Object.fromEntries(CENTS.map((x) => [x, 0])),
  };
}

const IS_CHINESE = APP_LANG === "MANDARIN";
const HUNDREDS = [20, 10, 5, 2];
const CENTS = IS_CHINESE ? [1, 0.5, 0.1, 0.05] : [1, 0.5, 0.2, 0.1];
const COUNTER_COIN_HEIGHT: Record<string, string> = {
  "1": "h-[55px] md:h-[62px] lg:h-[56.49px] lg:w-[56.49px]",
  "0.5": "h-[42px] md:h-[48px] lg:h-[51.35px] lg:w-[51.35px]",
  "0.2": "h-[35px] md:h-[40px] lg:h-[46.22px] lg:w-[46.22px]",
  "0.1": "h-[32px] md:h-[36px] lg:h-[41.08px] lg:w-[41.08px]",
  "0.05": "h-[31px] md:h-[35px] lg:h-[41.08px] lg:w-[41.08px]",
};
const COUNTER_COIN_BUTTON_SIZE: Record<string, string> = {
  "1": "lg:w-[56.49px] lg:h-[56.49px]",
  "0.5": "lg:w-[51.35px] lg:h-[51.35px]",
  "0.2": "lg:w-[46.22px] lg:h-[46.22px]",
  "0.1": "lg:w-[41.08px] lg:h-[41.08px]",
  "0.05": "lg:w-[41.08px] lg:h-[41.08px]",
};
const REGISTER_COIN_SIZE: Record<string, string> = {
  "1": "lg:size-[67.5px]",
  "0.5": "lg:size-[59.5px]",
  "0.2": "lg:size-[55.5px]",
  "0.1": "lg:size-[51.5px]",
};

function getAmount(budget: number) {
  return {
    hundreds: (budget > 10 ? 5 : 0) + Math.round(Math.random() * budget),
    cents: (Math.round(Math.random() * 100) * (IS_CHINESE ? 5 : 10)) % 100,
  };
}

export const Game2: React.FC<Props> = ({ onSuccess, onError, budget }) => {
  const [cash, setCash] = useState<Record<number, number>>(emptyCash());
  const [resetKey, setResetKey] = useState(0);
  const start = useMemo(() => new Date().getTime(), []);
  const { result, setResult, resetResult } = useResult();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { hundreds, cents } = useMemo(() => getAmount(budget), [budget, resetKey]);

  useEffect(() => {
    if (!result) return;
    const fn = result === "success" ? onSuccess : onError;

    const timeout = setTimeout(fn, 500, {
      time: diffTime(start) + "s",
      success: result === "success" ? "Yes" : "No",
    });

    return () => clearTimeout(timeout);
  }, [result, onSuccess, onError, start]);

  const showMessage = [...HUNDREDS, ...CENTS].find((x) => cash[x]);
  function getResultIcon() {
    if (result === "success") return <CorrectCircleIcon className="size-48" />;
    else if (result === "error") return <WrongCircleIcon className="size-48" />;
    else return null;
  }

  useEffect(() => {
    if (!isDemoPage()) return;
    const cb = () => setCash(emptyCash());
    window.addEventListener("demo-cc-clear", cb);
    return () => window.removeEventListener("demo-cc-clear", cb);
  }, []);

  useDemoReset(() => {
    resetResult();
    setCash(emptyCash());
    setResetKey((k) => k + 1);
  });

  return (
    <div
      className="relative flex flex-col overflow-y-auto lg:overflow-hidden full"
      style={{
        background:
          "radial-gradient(108.21% 50% at 50% 50%, rgba(242, 211, 191, 0.4) 0%, rgba(254, 142, 68, 0.4) 100%), #FFFFFF",
      }}
    >
      {result && <div className="absolute inset-0 z-50 c">{getResultIcon()}</div>}

      <div className="flex-grow cc !justify-evenly lg:flex-[432_1_0%] lg:flex-row lg:justify-between lg:items-center lg:gap-[130px] lg:py-[79px] lg:px-[77px] lg:bg-[#F3D7C6] lg:overflow-hidden">
        <div className="my-2 w-fit tall:my-6 lg:my-0 lg:w-[414px] lg:shrink-0">
          <div
            id="gs-required-money"
            className="h-24 mx-auto font-extrabold text-6xl text-white border-8 bg-[#34373A] border-[#5F6363] c w-80 md:scale-125 lg:!scale-100 lg:h-[100px] lg:w-[414px] lg:text-8xl lg:border-[12px]"
          >
            <span className="lg:inline-block lg:w-[340px] lg:h-[96px] lg:leading-[96px] lg:text-center lg:text-7xl lg:whitespace-nowrap lg:overflow-hidden">
              {IS_CHINESE ? "¥" : "$"} {hundreds}.{cents}
              {cents > 9 ? "" : "0"}
            </span>
          </div>
        </div>
        <div className="lg:w-[439px] lg:h-[243px] lg:flex lg:flex-col lg:items-end lg:gap-[8px]">
          <div
            className={`mx-auto text-center w-90 md:w-full md:text-2xl lg:w-full lg:text-[24px] lg:text-left lg:leading-tight ${
              showMessage ? "animate-slide-down" : "opacity-0 lg:opacity-100"
            }`}
          >
            {t.GS["Tap on the note or coin to remove it."]}
          </div>
          <div id="gs-money-counter" className="flex gap-1 md:gap-4 lg:gap-3 min-h-44 lg:min-h-[250px] lg:max-h-[250px] lg:w-[439px] lg:items-start lg:shrink-0 lg:pt-[10px] lg:pr-[10px]">
            {HUNDREDS.map((x) => (
              <button
                key={x}
                className="w-[72px] md:w-24 lg:w-[88px] lg:h-[205px] lg:shrink-0 relative"
                onClick={() => {
                  unlockAudioOnce();
                  setCash({ ...cash, [x]: cash[x] - 1 });
                  demoNextStep("gs-money-remove");
                }}
                style={{ display: cash[x] ? undefined : "none" }}
              >
                <Image src={`/images/task-5/game-2/${APP_LANG}/${x}.png`} alt="" width={88} height={205} className="lg:w-[88px] lg:h-[205px] lg:object-contain" />
                <Highlight num={cash[x]} />
              </button>
            ))}

            <div className="items-center fc justify-evenly lg:w-[56.49px] lg:h-[205.25px] lg:justify-between lg:pt-0 lg:gap-0">
              {CENTS.map((x) => (
                <button
                  key={x}
                  className={`relative lg:shrink-0 ${COUNTER_COIN_BUTTON_SIZE[String(x)] ?? ""}`}
                  onClick={() => {
                    unlockAudioOnce();
                    setCash({ ...cash, [x]: cash[x] - 1 });
                    demoNextStep("gs-money-remove");
                  }}
                  style={{ display: cash[x] ? undefined : "none" }}
                >
                  <Image
                    src={`/images/task-5/game-2/${APP_LANG}/${x * 100}-cent.png`}
                    width={62} height={62}
                    className={COUNTER_COIN_HEIGHT[String(x)] ?? "h-[32px] md:h-[36px] lg:h-[54px]"}
                    alt=""
                  />
                  <Highlight num={cash[x]} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="gs-money-register" className="bg-[#787878] md:py-5 lg:pt-[20px] lg:pr-[24px] lg:pb-[20px] lg:pl-[24px] lg:flex-[340_1_0%] lg:c">
        <div className="grid grid-cols-4 gap-2 px-4 py-2 mx-auto tall:py-4 w-fit lg:w-[342px] lg:h-[300px] lg:gap-[8px] lg:px-0 lg:py-0">
          {HUNDREDS.map((x) => (
            <button
              key={x}
              className="bg-[#303A43] pt-2 px-1 w-20 h-[185px] md:h-56 md:w-24 lg:w-[79.5px] lg:h-full lg:border-[8px] lg:border-[#303A43] lg:p-0 lg:overflow-hidden relative"
              onClick={() => {
                unlockAudioOnce();
                setCash({ ...cash, [x]: cash[x] + 1 });
                demoNextStep("gs-money-add");
              }}
            >
              <Image src={`/images/task-5/game-2/${APP_LANG}/${x}.png`} width={88} height={208} className="w-[72px] md:w-[88px] lg:w-full lg:h-full lg:object-fill lg:block" alt="" />
            </button>
          ))}

          {CENTS.map((x) => (
            <button
              key={x}
              className="bg-[#303A43] size-20 c pt-2 relative md:size-24 lg:size-[79.5px] lg:!pt-0 lg:!p-0 lg:!grid lg:!place-items-center lg:self-center"
              onClick={() => {
                unlockAudioOnce();
                setCash({ ...cash, [x]: cash[x] + 1 });
                demoNextStep("gs-money-add");
              }}
            >
              <Image
                src={`/images/task-5/game-2/${APP_LANG}/${x * 100}-cent.png`}
                width={80} height={80}
                className={`size-16 md:size-20 ${REGISTER_COIN_SIZE[String(x)] ?? "lg:size-[67px]"}`}
                alt=""
              />
            </button>
          ))}
        </div>
      </div>

      <div className="py-3 tall:py-5 px-6 bg-[#3A3A3A] w-full c lg:flex-[91_1_0%] lg:py-[20px] lg:px-[24px] lg:gap-[70px]">
        <Button
          btn="task5"
          className="md:scale-125 lg:!scale-100 lg:!w-[342px] lg:!h-[51px] lg:!py-[12px] lg:!text-[20px] lg:!font-extrabold lg:!leading-[100%]"
          onClick={() => {
            const a_hundreds = [20, 10, 5, 2, 1].map((x) => cash[x] * x).reduce((a, b) => a + b);
            const a_cents = [0.5, IS_CHINESE ? 0.05 : 0.2, 0.1]
              .map((x) => Math.round(cash[x] * x * 100))
              .reduce((a, b) => a + b);
            const a_total = a_hundreds + a_cents / 100;
            const total = hundreds + cents / 100;
            if (a_total === total) setResult("success");
            else {
              setResult("error");

              if (isDemoPage()) {
                setTimeout(() => {
                  setResult("");
                }, 1000);
              }
            }
          }}
        >
          {t.FORGOT_PASSWORD.Submit}
        </Button>
      </div>
    </div>
  );
};

function Highlight({ num = 0 }) {
  if (num < 2) return null;

  return (
    <div className="absolute size-5 md:scale-150 lg:scale-100 lg:size-6 lg:text-xs text-white bg-orange-500 rounded-full c -right-1.5 -top-1.5 z-[100]">
      {num}
    </div>
  );
}
