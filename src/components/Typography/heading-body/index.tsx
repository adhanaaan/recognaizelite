import { createElement } from "react";

// Type
import type { HeadingType } from "../TypographyType";
import styles from "./heading-body.module.scss";

export default function HeadingBody({ text, element = "p", fontWeight, color }: HeadingType) {
  return createElement(
    element,
    {
      className: `
            ${styles["heading-body"]}
			${styles[`heading-generate-weight--type-${fontWeight}`]}
			${styles[`heading-font-color--type-${color}`]}
			`,
    },
    text
  );
}
