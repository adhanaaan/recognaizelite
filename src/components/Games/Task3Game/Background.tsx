import { twMerge } from "tailwind-merge";

export function Background({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge("h-full section-padding", className)}
      style={{
        background:
          "radial-gradient(108.21% 50% at 50% 50%, rgba(200, 248, 216, 0.4) 0%, rgba(68, 234, 124, 0.4) 100%), #FFFFFF",
      }}
    >
      {children}
    </div>
  );
}
