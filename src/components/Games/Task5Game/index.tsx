import React, { useState } from "react";
import { t } from "src/lib/translations";
import { Button } from "src/NewComponents/Button";
import { Game1 } from "./Game-1";
import { Game2 } from "./Game-2";
import { StepProgressBar } from "./StepProgressBar";

export const Task5Game: React.FC<any> = ({ level, type, totalLevel, noInstruction, distractors, budget, ...props }) => {
  const [showInstructions, setShowInstructions] = useState(!noInstruction);

  let content;
  if (!budget)
    content = (
      <p className="text-[#4F4F4F] whitespace-pre-line">
        {distractors
          ? t.GS[
              "Select the items on the conveyor belt that are listed in the shopping list.\n\nBe careful! Pay closer attention to the colours and symbols."
            ]
          : t.GS["Select the items on the conveyor belt that are listed in the shopping list."]}
      </p>
    );
  else
    content = (
      <p className="text-[#4F4F4F]">
        {t.GS["Select the correct combination of money that adds up to the exact amount needed."]}
      </p>
    );

  if (showInstructions) {
    return (
      <div
        className="cc full section-padding"
        style={{
          background:
            "radial-gradient(108.21% 50% at 50% 50%, rgba(242, 211, 191, 0.4) 0%, rgba(254, 142, 68, 0.4) 100%), #FFFFFF",
        }}
      >
        <div className="w-full space-y-6">
          <div className="overflow-hidden text-center bg-white rounded-3xl">
            <StepProgressBar steps={totalLevel} progress={level} />
            <div className="px-8 py-6 space-y-3">
              <h1 className="leading-7">{t.GS["Round x"].replace("x", level + 1)}</h1>
              <div className="font-medium">{content}</div>
            </div>
          </div>
          <Button btn="task5" onClick={() => setShowInstructions(false)}>
            {t.GS["Start round"]}
          </Button>
        </div>
      </div>
    );
  }

  if (budget) {
    return <Game2 budget={budget} {...props} />;
  } else {
    return <Game1 distractors={distractors} {...props} />;
  }
};
