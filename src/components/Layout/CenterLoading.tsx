import React from "react";
import { PiSpinnerBold } from "react-icons/pi";
import { Background } from "src/components/Layout/Background";

interface props {}

export const CenterLoading: React.FC<props> = () => (
  <Background className="c">
    <PiSpinnerBold size={72} className="animate-spin" />
  </Background>
);
