import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { PcScreen } from "src/components/Layout/PcScreen";
import { useCountDown } from "src/hooks/useCountDown";

interface CountDownScreenProps extends React.PropsWithChildren {
  color: string;
  backgroundColor: string;
  time?: number;
  /**
   * "dots" (default) is the original three-pip countdown every funnel uses.
   * "numeric" counts down in big numerals under an optional title — the
   * ReCOGnAIze Lite treatment. Existing call sites pass neither and render
   * exactly as before.
   */
  variant?: "dots" | "numeric";
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
}

export const CountDownScreen: React.FC<CountDownScreenProps> = ({
  time = 3,
  children,
  color,
  backgroundColor,
  variant = "dots",
  title,
  subtitle,
  titleColor,
  subtitleColor,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { countDown } = useCountDown(time, () => setIsCompleted(true));

  if (isCompleted) return <>{children}</>;

  if (variant === "numeric") {
    return (
      <PcScreen>
        <div className="w-full h-full c" style={{ backgroundColor }}>
          <div className="flex flex-col items-center gap-8 px-8 text-center">
            {title && (
              <div className="max-w-[420px]">
                <h1
                  className="font-display text-[28px] sm:text-[34px] font-extrabold leading-[1.1]"
                  style={{ color: titleColor ?? color }}
                >
                  {title}
                </h1>
                {subtitle && (
                  <p
                    className="mt-2 font-jakarta text-[14px] leading-relaxed"
                    style={{ color: subtitleColor ?? "#85736b" }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* popLayout keeps the outgoing numeral from pushing the incoming
                one sideways while they cross-fade. */}
            <AnimatePresence mode="popLayout">
              <motion.span
                key={countDown}
                initial={{ scale: 0.55, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.45, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="font-display text-[112px] tall:text-[148px] font-extrabold leading-none tabular-nums"
                style={{ color }}
              >
                {countDown}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </PcScreen>
    );
  }

  return (
    <PcScreen>
      <div className="w-full h-full c" style={{ backgroundColor }}>
        <div className="flex space-x-10">
          {[...new Array(time)].map((_, idx) => (
            <div
              key={idx}
              className="rounded-full w-9 h-9"
              style={{
                backgroundColor: idx <= time - countDown ? color : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      </div>
    </PcScreen>
  );
};
