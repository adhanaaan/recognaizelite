/**
 * The small step marker above each screen's headline ("2 | Brain Health Quiz").
 *
 * The comps set these as dark text on a near-white pill, so `light` is the
 * default; `dark` stays available for placing one over a photo or a filled
 * panel, where the light pill would disappear.
 */
export function SectionBadge({
  label,
  tone = "light",
}: {
  label: string;
  tone?: "light" | "dark";
}) {
  const base =
    "inline-block rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]";

  if (tone === "dark") {
    return <span className={`${base} bg-[#1a1f3a] text-white`}>{label}</span>;
  }

  return (
    <span
      className={`${base} border border-quizOutline-variant/50 bg-quizSurface-lowest text-charcoal shadow-sm`}
    >
      {label}
    </span>
  );
}
