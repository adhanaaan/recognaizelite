import { twMerge } from "tailwind-merge";

interface MainLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function MainLayout({ children, className, ...props }: MainLayoutProps) {
  return (
    <main
      className={twMerge(
        "w-full min-h-screen",
        "flex flex-col justify-evenly",
        "px-[24px] pt-[80px] pb-[80px]", // Base (mobile)
        "md:px-[48px] md:pt-[120px] md:pb-[120px]", // Medium screens and up
        "lg:px-[96px] lg:pt-[10px] lg:pb-[16px]", // Large screens and up
        "lg:px-[64px] lg:pt-[120px] lg:pb-[120px]", // iPad Pro + small desktops
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
}
