import Router from "next/router";
import StopWatchIcon from "src/assets/stop-watch.svg";
import { t } from "src/lib/translations";
import { Button } from "./Button";

interface AboutTask {
  name: string;
  color: string;
  info: string;
  description: string;
  instruction: string;
  seconds: number;
}

const TASK_GRADIENTS: Record<string, string> = {
  task2: "radial-gradient(108.21% 50% at 50% 50%, rgba(228, 227, 255, 0.4) 0%, rgba(214, 141, 232, 0.4) 100%), #FFFFFF",
  task3: "radial-gradient(108.21% 50% at 50% 50%, rgba(200, 248, 216, 0.4) 0%, rgba(68, 234, 124, 0.4) 100%), #FFFFFF",
  task4: "radial-gradient(108.21% 50% at 50% 50%, rgba(175, 205, 250, 0.4) 0%, rgba(61, 136, 253, 0.4) 100%), #FFFFFF",
  task5: "radial-gradient(108.21% 50% at 50% 50%, rgba(242, 211, 191, 0.4) 0%, rgba(254, 142, 68, 0.4) 100%), #FFFFFF",
};

const VALID_TASK_SLUGS = ["symbol-matching", "trail-making", "airplane-game", "grocery-shopping", "cashier-chaos"];

const GIF_MAP: Record<string, string> = {
  "symbol matching": "/gif/symbol matching.gif",
  "trail making": "/gif/trail making.gif",
  "airplane game": "/gif/airplane game.gif",
};

export function AboutGameDesktopCombined({
  task,
  activeTask,
  taskRemaining,
}: {
  task: AboutTask;
  activeTask: string;
  taskRemaining?: number;
}) {
  const slug = task.name.replaceAll(" ", "-").toLowerCase();
  const demoRoute = VALID_TASK_SLUGS.includes(slug) ? `/${slug}/demo` : "/";
  const gifSrc = GIF_MAP[task.name.toLowerCase()];

  return (
    <div
      className="hidden lg:flex w-full h-dvh overflow-hidden items-center justify-center"
      style={{ background: TASK_GRADIENTS[activeTask] ?? TASK_GRADIENTS.task2 }}
    >      <div
        className="fc"
        style={{
          width: 1280,
          height: 832,
          transform: "scale(min(calc(100vw / 1280), calc(100dvh / 832)))",
          transformOrigin: "center center",
        }}
      >
        <section className="grid grid-cols-[436px_minmax(0,1fr)] flex-1">
          <div className="text-left w-[342px] ml-[94px] flex flex-col justify-center">
            <h4 className="text-left text-[#3A3A3A] [font-family:Avenir] [font-weight:800] text-[24px] leading-[100%] tracking-[0em] mb-[4px]">
              Next test
            </h4>
            <h1 style={{ color: task.color }} className="[font-family:Avenir] [font-weight:900] text-[32px] leading-[100%] tracking-[0em] mb-[20px]">
              {task.name}
            </h1>

            <div className="w-[100px] aspect-square rounded-[13px] border-[0.54px] border-white/50 bg-white box-border c mb-[32px]">
              <img
                className="w-full h-full object-contain"
                src={`/images/play/${task.name}.png`}
                alt={`${task.name} icon`}
              />
            </div>

            <p className="[font-family:Avenir] [font-weight:800] text-[20px] leading-[100%] tracking-[0em] text-[#3A3A3A] mb-[6px]">
              {task.info}
            </p>
            <p className="max-w-[342px] [font-family:Avenir] [font-weight:500] text-[20px] leading-[130%] tracking-[0em] text-[#3A3A3A]">
              {task.description}
            </p>
          </div>

          <div className="fc ml-[96px] pt-[41px] justify-center gap-[28px]">
            <div
              className="w-[682px] aspect-[672/390] rounded-[20.74px] border-[5.19px] bg-white/20 c overflow-hidden"
              style={{ borderColor: task.color }}
            >
              {gifSrc ? (
                <img src={gifSrc} alt={`${task.name} preview`} className="w-full h-full object-cover" />
              ) : (
                <p className="text-[18px] font-semibold text-black/50">GIF preview placeholder</p>
              )}
            </div>

            <div
              className="f items-start justify-between w-[682px] h-[150px] rounded-[14px] px-[29px] py-[17px] gap-[10px]"
              style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 40.63%, rgba(255, 255, 255, 0.12) 92.71%, rgba(255, 255, 255, 0) 100%)" }}
            >
              <div className="w-[430px] fc">
                <h4 className="[font-family:Avenir] [font-weight:800] text-[20px] leading-[100%] tracking-[0em] align-middle text-[#3A3A3A]">Instruction</h4>
                <p className="mt-[12px] [font-family:Avenir] [font-weight:500] text-[20px] leading-[100%] tracking-[0em] align-middle whitespace-pre-line">{task.instruction}</p>
              </div>

              <div className="shrink-0 text-left">
                <h4 className="text-[20px] font-bold leading-none text-black/75">Duration</h4>
                <p className="mt-[12px] f items-center justify-end gap-[8px] text-[36px] font-bold leading-none" style={{ color: task.color }}>
                  <StopWatchIcon className="size-[32px] fill-current" /> {task.seconds} Sec
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="cc fc w-full shrink-0 pb-[24px]">
          <Button className="w-[342px] h-[51px] py-[12px] gap-[10px] rounded-full" btn={activeTask} onClick={() => activeTask && Router.push(demoRoute)}>
            {t.GENERAL["Start tutorial"]}
          </Button>
          {taskRemaining && (
            <p className="pt-[8px] [font-family:Avenir] [font-weight:500] text-[16px] leading-[100%] tracking-[0em] text-center align-middle">
              {taskRemaining} tests remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
