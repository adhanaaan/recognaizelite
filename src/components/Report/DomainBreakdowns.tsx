import { BG_COLORS } from "./RiskIndicatorBar";

const RISKS: Record<string, React.ReactElement> = Object.fromEntries(
  ["High", "Moderate", "Low"].map((x, idx) => [
    x,
    <p
      style={{
        backgroundClip: "text",
        color: "transparent",
        backgroundImage: `linear-gradient(to bottom,${BG_COLORS[idx].from}, ${BG_COLORS[idx].to})`,
      }}
    >
      {x}
    </p>,
  ])
);

export function DomainBreakdowns({ domains }: { domains: { domain: string; risk: string }[] }) {
  return (
    <div className="text-white">
      <p className="px-1 pb-4 text-lg">Domain Breakdown</p>
      <div className="p-4 space-y-4 rounded-lg bg-gray-800/50">
        {domains.map(({ domain, risk }, idx) => (
          <div key={idx} className="justify-between font-light f">
            <p>{domain}</p>
            {RISKS[risk]}
          </div>
        ))}
      </div>
    </div>
  );
}
