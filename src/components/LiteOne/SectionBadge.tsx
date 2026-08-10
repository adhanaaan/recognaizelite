export function SectionBadge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full bg-[#1a1f3a] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
      {label}
    </span>
  );
}
