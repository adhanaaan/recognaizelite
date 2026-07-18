import type { StatCard } from "src/data/brainHealthStatCards";

interface StatCardScreenProps {
  card: StatCard;
  onNext: () => void;
  labels?: { didYouKnow?: string; source?: string; continue?: string };
}

/**
 * "Did you know" interstitial between question blocks — matches b2cfunnel's
 * StatCardScreen verbatim: tiny eyebrow, giant Jakarta-display cited stat,
 * body, source attribution, single CTA. Vertically centered so the stat
 * lands as a stop-and-read moment.
 */
export function StatCardScreen({ card, onNext, labels }: StatCardScreenProps) {
  return (
    <div className="flex min-h-[80vh] flex-col justify-center text-center animate-fade-up">
      <p className="text-xs font-bold uppercase tracking-widest text-quizPrimary font-jakarta">
        {labels?.didYouKnow ?? "Did you know"}
      </p>
      <p className="mt-6 font-display text-6xl sm:text-7xl font-extrabold text-quizPrimary">
        {card.stat}
      </p>
      <p className="mt-6 text-[19px] sm:text-xl leading-relaxed text-charcoal font-jakarta">
        {card.body}
      </p>
      <p className="mt-5 text-xs italic text-quizOutline font-jakarta">{labels?.source ?? "Source"}: {card.source}</p>

      <button
        type="button"
        onClick={onNext}
        className="mt-10 w-full rounded-lg bg-quizPrimary px-6 py-4 text-lg font-bold text-quizPrimary-on shadow-float transition hover:brightness-105 font-jakarta"
      >
        {labels?.continue ?? "Continue"}
      </button>
    </div>
  );
}
