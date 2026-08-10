import React from "react";
import { PiSpinnerBold } from "react-icons/pi";
import { Background } from "src/components/Layout/Background";

interface props {
  /** Key into Background's gradient map — lets a themed funnel avoid a cyan flash. */
  gradient?: string;
  /** Spinner colour. */
  color?: string;
}

export const CenterLoading: React.FC<props> = ({ gradient, color }) => (
  // The theme predicates behind `gradient`/`color` read localStorage, so SSR
  // always resolves to the default and the client may not. Only colours differ,
  // never the markup — the mismatch is expected, so don't warn about it.
  <Background className="c" gradient={gradient}>
    <PiSpinnerBold
      size={72}
      className="animate-spin"
      style={color ? { color } : undefined}
      suppressHydrationWarning
    />
  </Background>
);
