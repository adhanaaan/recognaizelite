import { createElement } from "react";

// Type
import type { HeadingType } from "../TypographyType";
import styles from "./heading-subtitle.module.scss";

export default function HeadingSubtitle({ text, element = "p", fontWeight, color }: HeadingType) {
  return createElement(
    element,
    {
      className: `
			${styles["heading-subtitle"]}
			${styles[`heading-generate-weight--type-${fontWeight}`]} 
			${styles[`heading-font-color--type-${color}`]}
			`,
    },
    text
  );
}
