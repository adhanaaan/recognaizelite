import React from "react";
import { PiSpinnerBold } from "react-icons/pi";
import { am } from "src/lib/audio-manager";
import { twMerge } from "tailwind-merge";

const BtnSizes = {
  xs: "text-xs px-2.5 py-1",
  sm: "text-sm leading-4 px-3 py-2",
  md: "text-sm px-5 py-2",
  lg: "text-base px-6 py-2",
  xl: "text-base px-7 py-3",
};

const ButtonType = {
  default: "bg-blue-500 hover:bg-blue-600",
  success: "bg-emerald-500 hover:bg-emerald-600",
  danger: "bg-red-500 hover:bg-red-600",
  accent: "bg-accent hover:brightness-125",
  none: "",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  disabled?: boolean;
  btn?: keyof typeof ButtonType;
  iconSize?: number;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  Icon?: React.ReactNode;
  loadingCentered?: boolean;
  size?: keyof typeof BtnSizes;
}

export const Button: React.FC<ButtonProps> = ({
  loading,
  btn = "default",
  icon,
  size = "md",
  disabled,
  iconSize,
  children,
  className,
  onClick,
  ...props
}) => {
  const classes = ["relative c text-white rounded-full"];

  classes.push(ButtonType[btn]);

  if (size) {
    classes.push(BtnSizes[size]);
  }

  if (disabled) {
    classes.push("cursor-not-allowed");
  }

  return (
    <button
      disabled={disabled}
      className={twMerge(classes.join(" "), className)}
      onClick={(e) => {
        am.play("click"), onClick?.(e);
      }}
      {...props}
    >
      {loading && (
        <div className="absolute w-full first bg-inherit">
          <PiSpinnerBold size={22} className="mx-auto animate-spin" />
        </div>
      )}
      {icon}
      {children}
    </button>
  );
};
