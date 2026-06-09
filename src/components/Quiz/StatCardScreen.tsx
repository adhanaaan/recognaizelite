import type { StatCard } from "src/data/brainHealthStatCards";

interface StatCardScreenProps {
  card: StatCard;
  onNext: () => void;
}

/**
 * "Did you know" interstitial between question blocks — credibility
 * punctuation rather than a question. Hierarchy: tiny eyebrow, giant
 * cited stat, body, attribution, single CTA. Matches b2cfunnel's
 * StatCardScreen layout, adjusted to the recognaize peach theme.
 */
export function StatCardScreen({ card, onNext }: StatCardScreenProps) {
  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col justify-center text-center min-h-[60vh]">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#E8793B]">
        Did you know
      </p>
      <p
        className="mt-5 text-[#E8793B] text-[56px] sm:text-[72px] font-extrabold leading-[0.95]"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {card.stat}
      </p>
      <p className="mt-6 text-[17px] sm:text-[19px] text-[#1F2937] leading-relaxed">
        {card.body}
      </p>
      <p className="mt-5 text-[11px] italic text-[#9CA3AF]">
        Source: {card.source}
      </p>

      <button
        type="button"
        onClick={onNext}
        className="mt-10 w-full rounded-full px-6 py-4 text-[16px] font-bold text-white tracking-wide transition-all active:scale-[0.98]"
        style={{ backgroundColor: "#E8793B", boxShadow: "0 6px 28px rgba(232,121,59,0.30)" }}
      >
        Continue
      </button>
    </div>
  );
}
