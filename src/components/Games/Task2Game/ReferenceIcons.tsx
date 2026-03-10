import { motion } from "framer-motion";
import { IconList } from "./utils";

export function ReferenceIcons({ randomList, desktopDemo = false }: { randomList: number[]; desktopDemo?: boolean }) {
  return (
    <div
      id="sb-reference-icons"
      className={[
        "grid grid-cols-5 c-shadow",
        desktopDemo
          ? "w-[565.20px] h-[312.58px] rounded-[49.15px] border-[1.23px] border-white/50 gap-[12.29px] p-[29.49px]"
          : "w-full rounded-[40px] gap-1 tall:gap-2 px-4 py-1 tall:py-3",
      ].join(" ")}
      style={{
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.435111) 50.99%, rgba(255, 255, 255, 0.415625) 87.11%, rgba(255, 255, 255, 0.0510417) 132.43%, rgba(255, 255, 255, 0) 147.3%)",
      }}
    >
      {[...Array(10)].map((_, idx) => (
        <div
          key={idx}
          id={`sb-reference-icon-${idx}`}
          className={desktopDemo ? "w-[clamp(74px,6.5vw,94px)] mx-auto" : "w-fit"}
        >
          <h5
            className={desktopDemo ? "[font-family:Avenir] [font-weight:800] text-[24.57px] leading-[150%] tracking-[-0.011em] text-center align-middle" : "text-lg font-bold text-center"}
            style={desktopDemo ? undefined : { fontSize: 16, lineHeight: "22px" }}
          >
            {idx}
          </h5>
          <motion.img
            key={IconList[randomList[idx]]}
            layoutId={IconList[randomList[idx]]}
            className={desktopDemo ? "w-[clamp(54px,5.2vw,76px)] h-[clamp(54px,5.2vw,76px)] mx-auto" : "size-8 tall:size-10"}
            src={`/images/task-2/${IconList[randomList[idx]]}`}
          />
        </div>
      ))}
    </div>
  );
}
