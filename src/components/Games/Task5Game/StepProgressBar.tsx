import React, { useRef } from "react";

interface props {
  steps: number;
  progress: number;
}

const colors = ["#E2E2E2", "#D9D9D9", "#CCCCCC", "#BFBFBF", "#B3B3B3", "#A6A6A6"];

export const StepProgressBar: React.FC<props> = ({ steps, progress }) => {
  const t = useRef(new Array(steps).fill(0));

  return (
    <div
      className="overflow-hidden"
      style={{
        background: `repeating-linear-gradient(90deg, #E2E2E2 0%, #A6A6A6 ${100 / steps}%)`,
      }}
    >
      {t.current.map((_, i) => (
        <div
          key={i}
          className="float-left h-3 duration-400"
          style={{
            width: `${100 / steps}%`,
            backgroundColor: i >= progress ? colors[i] ?? "#FDFDFD" : "var(--task5)",
          }}
        />
      ))}
    </div>
  );
};
