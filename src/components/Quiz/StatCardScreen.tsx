import type { StatCard } from "src/data/brainHealthStatCards";

interface StatCardScreenProps {
  card: StatCard;
  onContinue: () => void;
}

export function StatCardScreen({ card, onContinue }: StatCardScreenProps) {
  return (
    <div className="w-full max-w-[440px] mx-auto text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8793B]">
        Did you know?
      </p>
      <p
        className="mt-4 text-[#E8793B] text-[44px] sm:text-[56px] font-bold leading-[1.02]"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {card.stat}
      </p>
      <p
        className="mt-3 text-[#1F2937] text-[16px] sm:text-[18px] leading-[1.5]"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {card.body}
      </p>
      <p className="mt-4 text-[11px] text-[#9CA3AF]">{card.source}</p>

      <button
        type="button"
        onClick={onContinue}
        className="mt-7 w-full rounded-full px-6 py-3.5 text-[15px] font-bold text-white tracking-wide transition-all active:scale-[0.98]"
        style={{ backgroundColor: "#E8793B", boxShadow: "0 4px 24px rgba(232,121,59,0.30)" }}
      >
        Continue
      </button>
    </div>
  );
}
