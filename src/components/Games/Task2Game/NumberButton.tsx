import { useEffect, useState } from "react";

interface Props extends React.PropsWithChildren {
  active?: boolean;
  onClick: () => boolean;
  className?: string;
  desktopDemo?: boolean;
  id: string;
}

const InitialBgColor = "linear-gradient(180deg, #8735AC 0%, #250037 100%)";

export function NumberButton({ onClick, className, children, id, desktopDemo = false }: Props) {
  const [background, setBackground] = useState(InitialBgColor);

  useEffect(() => {
    const timeout = setTimeout(setBackground, 500, InitialBgColor);
    return () => clearTimeout(timeout);
  }, [background]);

  return (
    <button
      id={id}
      className={[
        "bg-gradient-to-b font-extrabold text-white rounded-full shadow-md shadow-gray-400 c last:col-span-3 last:mx-auto",
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
