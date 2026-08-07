import { twMerge } from "tailwind-merge";
import { PcScreen } from "./PcScreen";

const gradients: Record<string, string> = {
  default:
    "radial-gradient(108.21% 50% at 50% 50%, rgba(228, 227, 255, 0.4) 0%, rgba(141, 231, 244, 0.4) 100%), #FFFFFF",
  task2: "radial-gradient(108.21% 50% at 50% 50%, rgba(228, 227, 255, 0.4) 0%, rgba(214, 141, 232, 0.4) 100%), #FFFFFF",
  task3: "radial-gradient(108.21% 50% at 50% 50%, rgba(200, 248, 216, 0.4) 0%, rgba(68, 234, 124, 0.4) 100%), #FFFFFF",
  task4: "radial-gradient(108.21% 50% at 50% 50%, rgba(175, 205, 250, 0.4) 0%, rgba(61, 136, 253, 0.4) 100%), #FFFFFF",
  task5: "radial-gradient(108.21% 50% at 50% 50%, rgba(242, 211, 191, 0.4) 0%, rgba(254, 142, 68, 0.4) 100%), #FFFFFF",
  // ReCOGnAIze Lite — matches the cream surface the rest of /lite-one sits on.
  lite: "radial-gradient(108.21% 50% at 50% 50%, #fff4ee 0%, #fbe7de 100%), #FFFFFF",
};

/** Falls back to `default` for an unknown key, so callers can pass through freely. */
const gradientFor = (key: string) => gradients[key] ?? gradients.default;

export function Background({
  children,
  className,
  gradient,
  desktopFrame = false,
  fluid = false,
}: React.HTMLAttributes<HTMLDivElement> & { gradient?: string; desktopFrame?: boolean; fluid?: boolean }) {
  const content = (
    <div
      className={"w-full h-[100dvh] overflow-x-hidden overflow-y-auto fc"}
      style={{
        background: gradientFor(gradient ?? "default"),
      }}
      // Callers pick `gradient` from localStorage-backed theme predicates, so
      // SSR resolves to the default and the client may not. Colour-only, and
      // expected — so don't warn on it.
      suppressHydrationWarning
    >
      <div
        className={twMerge(
          fluid ? "flex-1 fc w-full" : "flex-1 fc max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );

  if (!desktopFrame) {
    return content;
  }

  return <PcScreen>{content}</PcScreen>;
}
