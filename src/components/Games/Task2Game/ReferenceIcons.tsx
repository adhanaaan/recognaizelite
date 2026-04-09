import { motion } from "framer-motion";
import { isDarkHookMode, isSjmcMode } from "src/utils/assessment";
import { IconList } from "./utils";

export function ReferenceIcons({ randomList, desktopDemo = false }: { randomList: number[]; desktopDemo?: boolean }) {
  const ikigai = isDarkHookMode();
  const sjmc = isSjmcMode();
  const darkGlass =
    "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 50.99%, rgba(255, 255, 255, 0.02) 100%)";
  const peachGlass =
    "linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 247, 242, 0.5) 50.99%, rgba(245, 212, 192, 0.3) 100%)";
  const lightGlass =
    "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.435111) 50.99%, rgba(255, 255, 255, 0.415625) 87.11%, rgba(255, 255, 255, 0.0510417) 132.43%, rgba(255, 255, 255, 0) 147.3%)";
  return (
    <div
      id="sb-reference-icons"
      className={[
        "grid grid-cols-5 c-shadow",
        desktopDemo
          ? `w-[565.20px] h-[312.58px] rounded-[49.15px] border-[1.23px] ${ikigai ? "border-white/20" : "border-white/50"} gap-[12.29px] p-[29.49px]`
          : `w-full rounded-[40px] gap-1 tall:gap-2 px-4 py-1 tall:py-3 ${ikigai ? "border border-white/10" : sjmc ? "border border-[#E5D5CA]" : ""}`,
      ].join(" ")}
      style={{ background: ikigai ? darkGlass : sjmc ? peachGlass : lightGlass }}
    >
      {[...Array(10)].map((_, idx) => (
        <div
          key={idx}
          id={`sb-reference-icon-${idx}`}
          className={desktopDemo ? "w-[clamp(74px,6.5vw,94px)] mx-auto" : "w-fit"}
        >
          <h5
            className={[
              desktopDemo ? "[font-family:Avenir] [font-weight:800] text-[24.57px] leading-[150%] tracking-[-0.011em] text-center align-middle" : "text-lg font-bold text-center",
              ikigai ? "text-gray-300" : "",
            ].join(" ")}
            style={desktopDemo ? (ikigai ? { color: "#d1d5db" } : undefined) : { fontSize: 16, lineHeight: "22px" }}
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
