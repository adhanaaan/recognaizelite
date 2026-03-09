import type { ElementType, ReactNode } from "react";
import type { FontWeightType, TypographyColorVariant, TypographyVariant } from "./TypographyType";

import HeadingBody from "./heading-body";
import HeadingH1 from "./heading-h1";
import HeadingH2 from "./heading-h2";
import HeadingSubtitle from "./heading-subtitle";

type TypographyProps = {
  variant: TypographyVariant;
  as?: ElementType;
  text: string | ReactNode;
  fontWeight: FontWeightType;
  color?: TypographyColorVariant;
};

export function Typography({ variant, text, color = "default", as: element, fontWeight }: TypographyProps) {
  const typography = {
    h1: <HeadingH1 text={text} element={element} fontWeight={fontWeight} color={color} />,
    h2: <HeadingH2 text={text} element={element} fontWeight={fontWeight} color={color} />,
    body: <HeadingBody text={text} element={element} fontWeight={fontWeight} color={color} />,
    subtitle: <HeadingSubtitle text={text} element={element} fontWeight={fontWeight} color={color} />,
  };

  return typography[variant];
}
