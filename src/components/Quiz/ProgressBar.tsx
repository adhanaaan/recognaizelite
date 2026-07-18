interface ProgressBarProps {
  current: number;
  total: number;
  labels?: { questionXOfY?: (current: number, total: number) => string };
}

/**
 * High-visibility funnel progress bar matching b2cfunnel's ProgressBar:
 * label + percentage on top, peach track below with an animated orange
 * fill that transitions over 500ms.
 */
export function QuizProgressBar({ current, total, labels }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((Math.min(current, total) / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-quizSecondary font-jakarta">
        <span>
          {labels?.questionXOfY
            ? labels.questionXOfY(Math.min(current, total), total)
            : `Question ${Math.min(current, total)} of ${total}`}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-quizSurface-high"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-quizPrimary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
