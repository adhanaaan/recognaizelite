import React from "react";

interface props {
  progress: number;
  color?: string;
  backgroundColor?: string;
}

export const ProgressBar: React.FC<props> = ({ progress, color, backgroundColor }) => {
  return (
    <div
      className="overflow-hidden rounded-full shadow-inner shadow-zinc-200 w-full"
      style={{ backgroundColor: backgroundColor }}
    >
      <div
        className="h-3 rounded-full duration-400"
        style={{
          width: progress ? progress + "%" : 12,
          backgroundImage: `linear-gradient(to bottom,${color + "88"}, ${color})`,
        }}
      />
    </div>
  );
};
