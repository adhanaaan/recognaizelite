import React from "react";
import { createPortal } from "react-dom";

interface props {
  open: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<props> = ({ open, children }) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed z-[1000] c inset-0 bg-gray-400 bg-opacity-90 backdrop-blur-sm">{children}</div>,
    document.getElementById("__next")!
  );
};
