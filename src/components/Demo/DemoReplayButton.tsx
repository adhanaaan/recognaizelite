import { Howl } from "howler";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ReplayIcon from "src/assets/replay.svg";
import { APP_LANG } from "src/constants";
import { t } from "src/lib/translations";
import { useConfigStore } from "src/stores/useConfigStore";
import { unlockAudioOnce } from "src/lib/audio-unlock";

export interface ReplayButtonProps {
  source?: string;
}

export function DemoReplayButton({ source }: ReplayButtonProps) {
  const lang = useConfigStore((s) => s.lang) ?? APP_LANG;
  const ref = useRef<Howl | null>(null);

  useEffect(() => {
    if (!source) return;

    const src = `/sounds/voiceover/${lang}/${source}`;
    const sound = new Howl({
      src: [src],
      html5: true,
      loop: false,
      onplayerror: () => {
        sound.once("unlock", () => sound.play());
        console.error("[SOUND]: Failed to play (locked?)", src);
      },
      onloaderror: (_id, error) => {
        console.error("[SOUND]: Failed to load", src, error);
      },
    });

    ref.current = sound;
    console.log("[SOUND]: ready", src);
    return () => {
      sound.unload();
      ref.current = null;
      console.log("[SOUND]: unload", src);
    };
  }, [source, lang]);

  return createPortal(
    <button
      className="absolute bottom-6 inset-x-0 mx-auto z-[1001] text-zinc-700 font-bold w-fit py-2 text-base-22 drop-shadow-md bg-white f rounded-full c px-4 c-shadow"
      onClick={() => {
        unlockAudioOnce();
        if (!ref.current) return;
        ref.current.stop();
        ref.current.play();
      }}
    >
      <ReplayIcon className="mr-2 size-5" /> {t.GAME_SPECIFIC["Replay audio"]}
    </button>,
    document.getElementById("__next")!
  );
}
