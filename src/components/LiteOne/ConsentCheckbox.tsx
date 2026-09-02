import React from "react";

/**
 * The rounded-square tickbox the lead form and the partner consent screen
 * both use.
 *
 * A native `<input type="checkbox">` underneath, made transparent rather than
 * replaced: the tick stays keyboard-reachable, announces its own state, and
 * keeps the label association a screen reader needs. The square you see is a
 * sibling `<span>`, which is also what `peer-focus-visible` can put a ring on.
 *
 * The tick and the filled box are driven from React state rather than
 * `peer-checked:`, because the tick sits inside that sibling span and the peer
 * variants only reach siblings of the input itself.
 *
 * The box is always aligned to the first line of its label: the lead form's
 * labels run to two or three lines and the partner screen's to three
 * paragraphs, so centring would leave it floating halfway down the block.
 */
export function ConsentCheckbox({
  id,
  checked,
  onChange,
  children,
  size = 26,
  className = "",
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  children: React.ReactNode;
  /** Box edge in px. The design draws it larger beside the longer label. */
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <span className="relative shrink-0" style={{ width: size, height: size }}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0"
        />
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg border transition-colors",
            checked
              ? "border-quizPrimary bg-quizPrimary"
              : "border-quizOutline-variant bg-quizSurface-lowest",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-quizPrimary/40 peer-focus-visible:ring-offset-1",
          ].join(" ")}
        >
          {checked && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[62%] text-white"
            >
              <path d="M4.5 12.6l5 5 10-10.5" />
            </svg>
          )}
        </span>
      </span>

      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        {children}
      </label>
    </div>
  );
}
