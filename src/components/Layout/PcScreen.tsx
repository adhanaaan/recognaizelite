import { twMerge } from "tailwind-merge";

interface PcScreenProps extends React.PropsWithChildren {
  className?: string;
  canvasClassName?: string;
}

export function PcScreen({ children, className, canvasClassName }: PcScreenProps) {
  return (
    <div className={twMerge("pc-screen-root", className)}>
      <div className="pc-screen-stage">
        <div className={twMerge("pc-screen-canvas", canvasClassName)}>{children}</div>
      </div>
    </div>
  );
}
