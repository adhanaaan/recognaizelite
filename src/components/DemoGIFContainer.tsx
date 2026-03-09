import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
}

export function DemoGIFContainer({ name, className, ...props }: Props) {
  const [borderRadius, setBorderRadius] = useState(28);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    setBorderRadius((ref.current?.clientHeight ?? 0) * 0.075);
  }, []);

  return (
    <div
      ref={ref}
      className={twMerge("relative overflow-hidden rounded-[32px] aspect-[100/210] c border border-black", className)}
      style={{ borderRadius }}
      {...props}
    >
      <img src={`/images/task-instruction/${name}.gif`} className="absolute inset-0 w-full h-full object-cover scale-[1.17]" />
    </div>
  );
}
