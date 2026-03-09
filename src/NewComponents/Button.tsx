import React from "react";
import { PiSpinnerBold } from "react-icons/pi";
import { am } from "src/lib/audio-manager";
import { twMerge } from "tailwind-merge";

const BtnSizes = {
  xs: "text-xs px-2.5 py-1",
  sm: "text-sm leading-4 px-3 py-2",
  md: "text-lg font-semibold px-5 py-2.5 sm:text-xl sm:py-3.5",
  lg: "text-lg px-6 py-3",
  xl: "text-lg px-7 py-4",
};

const ButtonType: Record<string, string> = {
  default: "linear-gradient(180deg, #138BB6 1.04%, #002D7C 98.96%)",
  task2: "linear-gradient(180deg, #8A42AB 1.04%, #630092 98.96%)",
  task3: "linear-gradient(180deg, #5BCFAC 1.04%, #02865E 98.96%)",
  task4: "linear-gradient(180deg, #48BFD8 1.04%, #006D85 98.96%)",
  task5: "linear-gradient(180deg, #E89660 1.04%, #C95101 98.96%)",
  none: "",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  disabled?: boolean;
  btn?: string;
  children?: React.ReactNode;
  size?: keyof typeof BtnSizes;
}

export const Button: React.FC<ButtonProps> = ({
  loading,
  disabled,
  children,
  className,
  onClick,
  btn = "default",
  size = "md",
  ...props
}) => {
  const classes = ["relative c text-white rounded-full w-full"];

  if (size) {
    classes.push(BtnSizes[size]);
  }

  if (disabled) {
    classes.push("cursor-not-allowed opacity-65");
  }

  return (
    <button
      disabled={disabled}
      className={twMerge(classes.join(" "), className)}
      onClick={(e) => {
        am.play("click"), onClick?.(e);
      }}
      style={{
        background: ButtonType[btn],
        boxShadow: "0px 4px 24px -1px rgba(167, 210, 208, 0.25)",
        backdropFilter: "blur(15px)",
      }}
      {...props}
    >
      {loading && (
        <div className="absolute w-full first bg-inherit">
          <PiSpinnerBold size={22} className="mx-auto animate-spin" />
        </div>
      )}
      {children}
    </button>
  );
};
