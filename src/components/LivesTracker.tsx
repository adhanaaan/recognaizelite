export function Heart({ filled = false }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow"
    >
      <path
        d="M12.5 21.35L11.05 20.03C5.9 15.36 2.5 12.27 2.5 8.5C2.5 5.41 4.92 3 8 3C9.74 3 11.41 3.81 12.5 5.08C13.59 3.81 15.26 3 17 3C20.08 3 22.5 5.41 22.5 8.5C22.5 12.27 19.1 15.36 13.95 20.03L12.5 21.35Z"
        fill={filled ? "url(#paint0_linear_2411_5417)" : "#fff"}
      />
      <defs>
        <linearGradient id="paint0_linear_2411_5417" x1="12.5" y1="3" x2="12.5" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF0000" />
          <stop offset="1" stopColor="#990000" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export interface LivesTrackerProps {
  lives: number;
  avlLives: number;
}

export function LivesTracker({ avlLives, lives }: LivesTrackerProps) {
  return (
    <div id="lives-tracker" className="flex flex-row gap-2">
      {Array(lives)
        .fill(0)
        .map((_, index) => (
          <Heart key={index} filled={index < avlLives} />
        ))}
    </div>
  );
}
