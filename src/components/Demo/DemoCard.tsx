import { twMerge } from "tailwind-merge";
import { useDemoContext } from "./DemoContext";
import BackIcon from "src/assets/back.svg";
import { t } from "src/lib/translations";
import { unlockAudioOnce } from "src/lib/audio-unlock";

export interface DemoCardProps {
  instruction?: string;
  instructionClassName?: string;
  arrow?: boolean;
  showActions?: boolean;
  showNextBtn?: boolean;
  showPreviousBtn?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  texts?: Record<string, string>;
}

export function DemoCard({
  instruction,
  instructionClassName,
  showActions = true,
  showNextBtn,
  showPreviousBtn,
  onNext,
  onPrevious,
  texts = {},
}: DemoCardProps) {
  const { colors } = useDemoContext().data;

  // Show action if any of the action is true
  const showAnyAction = showActions || showNextBtn || showPreviousBtn;

  return (
    <div
      className={twMerge(
        "mx-auto overflow-hidden w-72 rounded-3xl md:text-lg lg:text-xl font-medium c-shadow",
        instructionClassName
      )}
    >
      <div
        className="px-4 py-6 font-bold text-center whitespace-pre-line text-base-22"
        style={{
          color: "#3A3A3A",
          background: "linear-gradient(180deg, #FDFDFD 0%, #DBDBDB 100%)",
        }}
      >
        {instruction}
      </div>
      {showAnyAction && (
        <div className="f">
          {(showPreviousBtn ?? onPrevious) && (
            <button
              className="flex-1 px-4 py-2 font-bold c text-base-22"
              style={{
                color: colors.color,
                backgroundImage: `linear-gradient(180deg, ${colors.previousBtn1} 0%, ${colors.previousBtn2} 100%)`,
              }}
              onClick={() => {
                unlockAudioOnce();
                onPrevious?.();
              }}
            >
              <BackIcon className="w-4 mr-1 -ml-2" /> {texts.previous ?? t.GAME_SPECIFIC.Previous}
            </button>
          )}

          {(showNextBtn ?? onNext) && (
            <button
              className="flex-1 px-4 py-2 font-bold c text-base-22"
              onClick={() => {
                unlockAudioOnce();
                onNext?.();
              }}
              style={{
                color: "white",
                backgroundImage: `linear-gradient(180deg, ${colors.secondaryColor} 1.04%, ${colors.color} 98.96%)`,
              }}
            >
              <span className="animate-bounce-right f">
                {texts.next ?? t.GAME_SPECIFIC.Next} <BackIcon className="w-4 ml-1 -mr-2 rotate-180" />
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
