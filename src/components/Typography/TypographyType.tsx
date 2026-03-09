import type { ElementType, ReactNode } from "react";

export type FontWeightType = "regular" | "medium" | "semibold" | "bold";
export type TypographyVariant = "body" | "subtitle" | "h1" | "h2";
export type TypographyColorVariant = "default" | "warning" | "info" | "success" | "error" | "secondary" | "lightdark";
export type HeadingType = {
  text: string | ReactNode;
  element?: ElementType;
  fontWeight: FontWeightType;
  color?: TypographyColorVariant;
};
