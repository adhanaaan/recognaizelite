interface ProgressBarProps {
  current: number;
  total: number;
}

export function QuizProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className="w-full max-w-[440px] mx-auto">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF]">
          Brain Health Check
        </span>
        <span className="text-[11px] font-semibold text-[#4B5563]">
          {Math.min(current, total)} / {total}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(232,121,59,0.12)" }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: "#E8793B" }}
        />
      </div>
    </div>
  );
}
