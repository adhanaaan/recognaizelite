import React, { memo } from "react";

interface props {
  id: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const checkForFlip = (a: number, b: number, c: number, d: number) => {
  if ((a > c && b > d) || (a < c && b < d)) return false;

  return true;
};

export const ConnectingLine: React.FC<props> = memo(({ top, left, bottom, right, id }) => {
  const height = Math.abs(bottom - top),
    width = Math.abs(right - left);

  const empty = width === 0;

  return (
    <svg
      id={id}
      height={height}
      width={Math.max(width, 6)}
      style={{
        top: Math.min(top, bottom),
        left: Math.min(left, right),
        ...(checkForFlip(top, left, bottom, right) && {
          transform: "scaleX(-1)",
        }),
        marginLeft: empty ? "-3px" : "0px",
      }}
      className="absolute stroke-task3"
    >
      {empty ? (
        <line x1="6" y1="0" x2="6" y2={height} strokeWidth="10" />
      ) : (
        <line x1="0" y1="0" x2={width} y2={height} strokeWidth="6" />
      )}
    </svg>
  );
});
