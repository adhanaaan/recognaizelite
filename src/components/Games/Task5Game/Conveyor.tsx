import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import CorrectCircleIcon from "src/assets/correct-circle.svg";
import WrongCircleIcon from "src/assets/wrong-circle.svg";
import { useResult } from "src/hooks/useResult";
import { unlockAudioOnce } from "src/lib/audio-unlock";

function ConveyorItem({ onClick, onDrop, src, style, isDesktop }: any) {
  const { result, setResult } = useResult();
  const Icon = result === "success" ? CorrectCircleIcon : WrongCircleIcon;

  if (!src) return null;

  return (
    <div
      style={isDesktop ? { ...style, width: 195.82, height: 195.82, overflow: "visible" } : style}
      onClick={() => {
        unlockAudioOnce();
        !result && setResult(onClick() ? "success" : "error");
      }}
      onAnimationEnd={result ? undefined : onDrop}
      className={isDesktop
        ? "group absolute -translate-y-1/2 -left-1/2 conveyor-move cursor-pointer select-none"
        : "absolute w-32 -translate-y-1/2 md:w-36 lg:w-40 -left-1/2 conveyor-move cursor-pointer select-none"
      }
    >
      {isDesktop && !result && (
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            borderRadius: 200,
            background: "#756D79",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 0,
          }}
        />
      )}
      <Image
        src={src}
        alt=""
        className="full"
        style={isDesktop ? { position: "relative", zIndex: 1 } : undefined}
        width={isDesktop ? 195.82 : 160}
        height={isDesktop ? 195.82 : 160}
        draggable={false}
      />
      {result && <Icon className="absolute inset-0 m-auto size-28" style={isDesktop ? { zIndex: 2 } : undefined} />}
    </div>
  );
}

interface Props {
  shoppingListGroup: string[][];
  onItemClick: (x: string) => boolean;
  onItemDrop: (x: string) => boolean;
  listOpen?: boolean;
}

let _uid = 0;
type CItem = { src: string; group: number; delay: number; id: number };

function getItems(images: string[], group: number) {
  return images.sort(() => Math.random() - 0.5).map((x) => ({ src: x, group, id: _uid++ }));
}

export function Conveyor({ shoppingListGroup, onItemClick, onItemDrop, listOpen = false }: Props) {
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
  const conveyorTime = isDesktop ? "4.5s" : "4s";
  const itemDelay = isDesktop ? 1.7 : 1.5;

  // Tracks wall-clock time (in seconds from startRef) when the next item should appear.
  // If the belt runs dry, schedule() catches up to "now" so items flow in immediately.
  // Refs are only accessed inside useEffect and event handlers — never during render.
  const startRef = useRef(0);
  const nextTimeRef = useRef(0);

  function schedule(items: Array<{ src: string; group: number; id: number }>): CItem[] {
    const now = (Date.now() - startRef.current) / 1000;
    if (nextTimeRef.current < now) nextTimeRef.current = now; // catch up if belt was empty
    return items.map((item) => {
      const delay = nextTimeRef.current - now;
      nextTimeRef.current += itemDelay;
      return { ...item, delay };
    });
  }

  function removeItem(id: number) {
    setConveyorItems((prev) => prev.filter((x) => x.id !== id));
  }

  const [conveyorItems, setConveyorItems] = useState<CItem[]>([]);

  // Initialize / reset when shoppingListGroup changes (runs after paint, never during render)
  useEffect(() => {
    startRef.current = Date.now();
    nextTimeRef.current = 0;
    if (!shoppingListGroup.length) {
      setConveyorItems([]);
      return;
    }
    setConveyorItems(schedule(shoppingListGroup.map((x, idx) => getItems(x, idx)).flat()));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoppingListGroup]);

  function addItems(group: number) {
    const items = getItems(shoppingListGroup[group], group);
    // schedule() uses nextTimeRef so new items appear immediately after the last queued item,
    // or right now if the belt has already run dry.
    setConveyorItems((prev) => [...prev, ...schedule(items)]);
  }

  const divider = (
    <div className="drop-shadow">
      <div className="shadow-md h-11 conveyor-corner" />
      <div className="h-1.5 conveyor-corner mix-blend-hard-light" />
    </div>
  );

  return (
    <div
      id="gs-conveyor"
      className="flex flex-col justify-between shadow-md bg-[#333333] my-8 tall:my-16 h-[340px] tall-lg:h-96"
    >
      {divider}

      <div className="relative flex" style={isDesktop && listOpen ? { visibility: "hidden", pointerEvents: "none" } : undefined}>
        {conveyorItems.map(({ src, group, delay, id }) => (
          <ConveyorItem
            key={id}
            src={src}
            isDesktop={isDesktop}
            onClick={() => onItemClick(src)}
            onDrop={() => { removeItem(id); if (onItemDrop(src)) addItems(group); }}
            style={{ animationDelay: `${delay}s`, "--conveyor-time": conveyorTime } as React.CSSProperties}
          />
        ))}
      </div>
      {divider}
    </div>
  );
}
