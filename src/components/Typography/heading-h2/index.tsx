import { createElement } from "react";

// Type
import type { HeadingType } from "../TypographyType";
import styles from "./heading-h2.module.scss";

export default function HeadingH2({ text, element = "h3", fontWeight, color }: HeadingType) {
  return createElement(
    element,
    {
      className: `
			${styles["heading-subtitle"]}
  			${fontWeight === "bold" ? "font-bold" : ""}
			${styles[`heading-font-color--type-${color}`]}
			`,
    },
    text
  );
}
