import React from "react";
import { twMerge } from "tailwind-merge";

interface props extends React.PropsWithChildren {
  iconSize?: number;
  className?: string;
}

export const IconButton: React.FC<props & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  iconSize,
  children,
  ...props
}) => {
  return (
    <button className={twMerge("aspect-square rounded-md p-2", className)} {...props}>
      {children}
    </button>
  );
};
