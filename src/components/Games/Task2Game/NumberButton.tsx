import { useEffect, useState } from "react";
import { isDarkHookMode, isNoviMode, isSjmcMode } from "src/utils/assessment";

interface Props extends React.PropsWithChildren {
  active?: boolean;
  onClick: () => boolean;
  className?: string;
  desktopDemo?: boolean;
  id: string;
}

const InitialBgColor = "linear-gradient(180deg, #8735AC 0%, #250037 100%)";
const IkigaiBgColor = "linear-gradient(180deg, #1a7a74 0%, #0d3d3a 100%)";
const NoviBgColor = "linear-gradient(180deg, #EBB02D 0%, #C8960F 100%)";
const SjmcBgColor = "linear-gradient(180deg, #E8793B 0%, #C05A20 100%)";

export function NumberButton({ onClick, className, children, id, desktopDemo = false }: Props) {
  const novi = isNoviMode();
  const ikigai = isDarkHookMode();
  const sjmc = isSjmcMode();
  const defaultBg = novi ? NoviBgColor : ikigai ? IkigaiBgColor : sjmc ? SjmcBgColor : InitialBgColor;
  const [background, setBackground] = useState(defaultBg);

  useEffect(() => {
    const timeout = setTimeout(setBackground, 500, defaultBg);
    return () => clearTimeout(timeout);
  }, [background]);

  return (
    <button
      id={id}
      className={[
        `bg-gradient-to-b font-extrabold ${novi ? "text-[#1B2130]" : "text-white"} rounded-full shadow-md ${novi ? "shadow-black/30" : ikigai ? "shadow-black/30" : sjmc ? "shadow-[#C4A48F]/40" : "shadow-gray-400"} c last:col-span-3 last:mx-auto`,
        desktopDemo
          ? "w-[85.86px] h-[85.86px] text-[48px] leading-none"
          : "size-11 tall:h-14 tall:w-14 tall-lg:size-16 text-[24px] tall:text-[32px] leading-[32px] tall:leading-[40px]",
        className,
      ].join(" ")}
      onClick={() =>
        onClick()
          ? setBackground("linear-gradient(180deg, #90440A 0%, #D25D03 100%)")
          : setBackground("linear-gradient(180deg, #90440A 0%, #D25D03 100%)")
      }
      style={{
        filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15))",
        background,
      }}
    >
      {children}
    </button>
  );
}
