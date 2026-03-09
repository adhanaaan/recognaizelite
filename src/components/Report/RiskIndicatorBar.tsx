export const BG_COLORS = [
  {
    from: "#A0FEA9",
    to: "#71FB5B",
  },
  {
    from: "#A0E2FE",
    to: "#5BCBFB",
  },
  {
    from: "#FEEEA0",
    to: "#FBAF5B",
  },
];

export function RiskIndicatorBar() {
  return (
    <div>
      <div className="py-3">
        <div className="flex overflow-hidden rounded-full">
          {BG_COLORS.map(({ from, to }, idx) => (
            <div
              key={idx}
              className="w-full h-4"
              style={{
                backgroundImage: `linear-gradient(to bottom,${from}, ${to})`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between text-sm font-thin text-white">
        <p>LOW RISK</p>
        <p>HIGH RISK</p>
      </div>
    </div>
  );
}
