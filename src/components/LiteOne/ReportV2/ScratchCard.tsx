import { motion, useReducedMotion } from "framer-motion";
import React from "react";

/**
 * Scratch-to-reveal tip card.
 *
 * The tip itself is ordinary DOM content — the canvas only visually masks
 * it, so screen readers and find-in-page always reach the text. Scratching
 * erases the canvas with destination-out strokes; progress is tracked on a
 * coarse cell grid (no getImageData polling) and past 45% the rest clears
 * itself, like a real ticket you stop scratching once you can read it.
 *
 * Reduced motion, missing pointer support and keyboard users all get the
 * same "tap to reveal" path instead of the scratch gesture.
 */

const CELL_COLS = 12;
const CELL_ROWS = 16;
const REVEAL_AT = 0.45;
const BRUSH = 30;

export function ScratchCard({
  chip,
  chipClassName,
  headline,
  ruleColor,
  body,
  onRevealed,
}: {
  chip: string;
  chipClassName: string;
  headline: string;
  ruleColor: string;
  body: string;
  onRevealed?: () => void;
}) {
  const reduced = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const cellsRef = React.useRef<Set<number>>(new Set());
  const lastPointRef = React.useRef<{ x: number; y: number } | null>(null);
  const scratchingRef = React.useRef(false);
  const [revealed, setRevealed] = React.useState(false);
  const [fading, setFading] = React.useState(false);
  const [canScratch, setCanScratch] = React.useState(false);

  React.useEffect(() => {
    // The gesture needs pointer events and a canvas; anything else falls
    // back to the tap-to-reveal button.
    setCanScratch(!reduced && typeof window !== "undefined" && "PointerEvent" in window);
  }, [reduced]);

  const reveal = React.useCallback(() => {
    setFading(true);
    window.setTimeout(() => setRevealed(true), 480);
    onRevealed?.();
  }, [onRevealed]);

  // Paint the foil. Runs whenever the scratch layer mounts.
  React.useEffect(() => {
    if (!canScratch || revealed) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { width, height } = wrap.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCanScratch(false);
      return;
    }
    ctx.scale(dpr, dpr);

    // Warm white foil with a soft peach glow and a dot grid, echoing the
    // design's ticket texture.
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(
      width * 0.5,
      -height * 0.18,
      10,
      width * 0.5,
      -height * 0.18,
      height * 0.75
    );
    glow.addColorStop(0, "rgba(255,196,150,0.55)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#DED4CC";
    for (let row = 0; row < 6; row += 1) {
      for (let col = 0; col < 6; col += 1) {
        const ox = row % 2 === 0 ? 0 : width / 12;
        ctx.beginPath();
        ctx.arc(width * 0.08 + (col * width) / 6 + ox, height * 0.16 + (row * height) / 7, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // "Scratch here" pill + caption, drawn on the foil so they erase with it.
    const pillW = 168;
    const pillH = 48;
    const pillX = width / 2 - pillW / 2;
    const pillY = height * 0.62;
    ctx.save();
    ctx.shadowColor = "rgba(90,40,10,0.18)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "#FFF6EF";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 24);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#F2DDCE";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 24);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#8C3A18";
    ctx.font = "700 17px 'Plus Jakarta Sans', 'Avenir', sans-serif";
    ctx.fillText("Scratch here", width / 2, pillY + pillH / 2 + 1);
    ctx.fillStyle = "#8A7568";
    ctx.font = "500 13px 'Plus Jakarta Sans', 'Avenir', sans-serif";
    ctx.fillText("Use your finger, like a lucky draw ticket", width / 2, pillY + pillH + 26);

    // Concentric hint circles above the pill.
    ctx.strokeStyle = "rgba(247,117,40,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.44, 29, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(247,117,40,0.9)";
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.44, 19, 0, Math.PI * 2);
    ctx.fill();

    cellsRef.current = new Set();
  }, [canScratch, revealed]);

  const scratchTo = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !wrap || !ctx) return;
    const rect = wrap.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH * 2;
    ctx.beginPath();
    const last = lastPointRef.current;
    ctx.moveTo(last ? last.x : x, last ? last.y : y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, BRUSH, 0, Math.PI * 2);
    ctx.fill();
    lastPointRef.current = { x, y };

    // Count coverage on a coarse grid, marking the brush's neighbourhood.
    const cells = cellsRef.current;
    const col = Math.floor((x / rect.width) * CELL_COLS);
    const row = Math.floor((y / rect.height) * CELL_ROWS);
    for (let dc = -1; dc <= 1; dc += 1) {
      for (let dr = -1; dr <= 1; dr += 1) {
        const c = col + dc;
        const r = row + dr;
        if (c >= 0 && c < CELL_COLS && r >= 0 && r < CELL_ROWS) {
          cells.add(r * CELL_COLS + c);
        }
      }
    }
    if (cells.size / (CELL_COLS * CELL_ROWS) >= REVEAL_AT) reveal();
  };

  const showFoil = canScratch && !revealed;

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-[28px] shadow-[0_18px_46px_-24px_rgba(90,40,10,0.35)]"
      >
        {/* The tip — always in the DOM. */}
        <div className="relative min-h-[430px] bg-[#EFF6FF] px-7 pb-9 pt-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-14 -top-14 h-[190px] w-[190px] rounded-full bg-[#DBEAFE]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-16 top-24 h-[14px] w-[14px] rounded-full bg-[#BFDBFE]"
          />
          <span className={`relative inline-block rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] ${chipClassName}`}>
            {chip}
          </span>
          <motion.div
            className="relative mt-24"
            initial={false}
            animate={
              revealed || !canScratch
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 1, y: 0, scale: 0.985 }
            }
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
          >
            <p
              className="text-[27px] leading-[1.34] text-[#171717]"
              style={{ fontFamily: "'Lora', Georgia, serif", fontWeight: 500 }}
            >
              {headline}
            </p>
            <div
              aria-hidden
              className="mt-5 h-[3px] w-11 rounded-full"
              style={{ background: ruleColor }}
            />
            <p className="mt-4 text-[15.5px] leading-[1.52] text-[#404040]">{body}</p>
          </motion.div>
        </div>

        {/* The foil. */}
        {showFoil && (
          <canvas
            ref={canvasRef}
            role="button"
            tabIndex={0}
            aria-label="Scratch or press Enter to reveal your tip"
            className="absolute inset-0 h-full w-full cursor-pointer rounded-[28px] transition-opacity duration-500 ease-out"
            style={{ touchAction: "none", opacity: fading ? 0 : 1 }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                reveal();
              }
            }}
            onPointerDown={(event) => {
              scratchingRef.current = true;
              lastPointRef.current = null;
              event.currentTarget.setPointerCapture(event.pointerId);
              scratchTo(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => {
              if (!scratchingRef.current) return;
              scratchTo(event.clientX, event.clientY);
            }}
            onPointerUp={() => {
              scratchingRef.current = false;
              lastPointRef.current = null;
            }}
            onPointerCancel={() => {
              scratchingRef.current = false;
              lastPointRef.current = null;
            }}
          />
        )}

        {/* Tap-to-reveal path when the gesture isn't available. */}
        {!canScratch && !revealed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[28px] bg-white/95 px-6 text-center">
            <p className="text-[15px] font-bold text-[#5F4638]">Your tip is hiding under here.</p>
            <button
              type="button"
              onClick={reveal}
              className="rounded-full border border-[#F2DDCE] bg-[#FFF6EF] px-6 py-3 text-[15px] font-bold text-[#8C3A18] transition-colors hover:bg-[#FFEFE3]"
            >
              Tap to reveal
            </button>
          </div>
        )}
      </div>

      {/* Screen readers hear the reveal; sighted users watch it. */}
      <p aria-live="polite" className="sr-only">
        {revealed || !canScratch ? `Tip revealed: ${headline}` : ""}
      </p>

      {showFoil && !fading && (
        <button
          type="button"
          onClick={reveal}
          className="mx-auto mt-3 block text-[12.5px] font-bold text-[#A98D7D] underline underline-offset-4 transition-colors hover:text-[#8A4A22]"
        >
          Skip the scratching — just show me
        </button>
      )}
    </div>
  );
}
