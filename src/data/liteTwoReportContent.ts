/**
 * Copy for the /lite-two report — the personalised v2 report.
 *
 * The page splits its wording two ways, per the RevitalAIze v2 designs
 * (Figma nodes 1284-6661, 1304-150, 1293-150, 1303-150):
 *
 *   persona — "optimizer" (under 40) vs "senior" (quiz age 40-49, 50-59, 60+).
 *   band    — "strong" (severity High) vs "weak" (everything else).
 *
 * Kept out of the page component so the wording can be reviewed on its own,
 * following src/data/liteOneContent.ts. Everything that changes between the
 * four Figma frames lives here; the layout, charts and motion stay shared in
 * the page. Lines that need live numbers are functions of `LiteTwoCopyCtx`.
 */

export type LiteTwoPersona = "optimizer" | "senior";
export type LiteTwoBand = "strong" | "weak";
export type LiteTwoVariantKey = `${LiteTwoPersona}-${LiteTwoBand}`;

export function liteTwoVariantKey(
  persona: LiteTwoPersona,
  band: LiteTwoBand
): LiteTwoVariantKey {
  return `${persona}-${band}`;
}

export type LiteTwoCopyCtx = {
  /** First name, null when the visitor never gave one. */
  name: string | null;
  percentile: number;
  /** 100 - percentile, floored at 1 — "top X%". */
  topBand: number;
  /** Domain title, lowercased ("processing speed"). */
  domain: string;
  /** Mean seconds per correct symbol (60s / score), null without a score. */
  avgSeconds: string | null;
  /** "60 and over" etc. — the raw quiz age band's label, null when unknown. */
  ageLabel: string | null;
};

export type LiteTwoReportCopy = {
  hero: {
    eyebrow: string;
    /** "countup" renders the animated "faster than {pct}%" headline. */
    h1Kind: "countup" | "plain";
    /** Used when h1Kind is "plain". */
    h1: (ctx: LiteTwoCopyCtx) => string;
    /** The line under the age-band curve. */
    sub: (ctx: LiteTwoCopyCtx) => string;
    scrollCue: string;
  };
  meaning: {
    /** The line introducing the daily-life examples. */
    intro: string;
    perks: readonly string[];
    accent: string;
  };
  tip: {
    h2: (ctx: LiteTwoCopyCtx) => string;
    chip: string;
    chipClassName: string;
    ruleColor: string;
    headline: string;
    body: string;
    shareText: string;
  };
  risk: {
    body: string;
    actionablesIntro: string;
    actionables: readonly string[];
  };
  baseline: {
    eyebrow: string;
    /** Rendered around the gradient "2 (out) of 5" span. */
    h2Lead: string;
    h2Gradient: string;
    paragraphs: readonly string[];
  };
  product: {
    eyebrow: string;
    h2: string;
    /** The page appends the italicised journal name after this. */
    bodyLead: string;
  };
  closing: {
    quote: readonly string[];
    attribution: (ctx: LiteTwoCopyCtx) => string;
  };
  exit: {
    body: string;
    body2: string;
  };
};

/** What high processing speed feels like in a normal day. */
const SPEED_PERKS = [
  "Keep up with fast-paced conversations",
  "Adapt swiftly to changing environments",
  "Add up the bill before the cashier finishes scanning",
] as const;

/**
 * The same three scenarios, flipped for the senior weak band — its intro is
 * "A slower speed often shows up like this:", so the rows read as what the
 * visitor may have noticed. (The Figma frame shows photos without captions;
 * these lines are the template's perk rows recast to fit that intro.)
 */
const SPEED_STRUGGLES = [
  "Fast conversations take more effort to follow",
  "Busy environments feel harder to keep up with",
  "Adding up the bill takes longer than it used to",
] as const;

const STRONG_ACCENT = "If those feel effortless, your score just told you why.";
const WEAK_ACCENT = "If any of those feel like work lately, your score is the reason.";

const MEMORY_CHIP = {
  chip: "Memory",
  chipClassName: "bg-[#DBEAFE] text-[#1E3A8A]",
  ruleColor: "#3B82F6",
} as const;

const SPEED_CHIP = {
  chip: "Speed",
  chipClassName: "bg-[#FFEDD5] text-[#9A3412]",
  ruleColor: "#F97316",
} as const;

const OPTIMIZER_RISK_BODY =
  "We looked at your risk factors too — health and lifestyle habits like high blood pressure, poor sleep, or not enough exercise can slow your brain down over time.";

const SENIOR_RISK_BODY =
  "We also looked at your risk factors. Habits like high blood pressure, poor sleep, hearing loss, or too little exercise can slow your thinking over the years.";

const OPTIMIZER_PRODUCT = {
  eyebrow: "Take the test",
  h2: "What do you do now? Take the FULL ReCOGnAIze assessment",
  bodyLead:
    "Validated against MRI scans, built on a five-year NTU study of 1,500 people and published in ",
} as const;

const SENIOR_PRODUCT = {
  eyebrow: "How the test works",
  h2: "What do you do now? Take the FULL ReCOGnAIze assessment",
  bodyLead:
    "Validated against MRI brain scans, built on a five-year NTU study of 1,500 adults, published in ",
} as const;

const withName = (name: string | null, line: string) =>
  name ? `${name}, ${line}` : line[0].toUpperCase() + line.slice(1);

export const LITE_TWO_REPORT_COPY: Record<LiteTwoVariantKey, LiteTwoReportCopy> = {
  "optimizer-strong": {
    hero: {
      eyebrow: "Reaction time challenge",
      h1Kind: "countup",
      h1: ({ name, percentile }) =>
        withName(name, `you are faster than ${percentile}% of your peers.`),
      sub: ({ topBand, domain }) =>
        `That is the top ${topBand}% of your age band on ${domain}.`,
      scrollCue: "Tell me more",
    },
    meaning: {
      intro: "With high processing speed, you can:",
      perks: SPEED_PERKS,
      accent: STRONG_ACCENT,
    },
    tip: {
      h2: ({ name }) =>
        name
          ? `${name}, here's a special tip to optimize your speed`
          : "Here's a special tip to optimize your speed",
      ...MEMORY_CHIP,
      headline: "Recall a friend's kopi order without checking.",
      body: "Little details like this are your memory being kind. Practise holding one small fact through a whole conversation — it keeps the fast lanes fast.",
      shareText:
        "My tip from a 60-second brain speed test: recall a friend's kopi order without checking. Try yours:",
    },
    risk: {
      body: OPTIMIZER_RISK_BODY,
      actionablesIntro: "Here are 3 actionables you can do right now",
      actionables: [
        "Keep doing what you're doing — your speed is strong, so protect it with consistent sleep and regular exercise.",
        "Challenge your brain daily — try a new route to work, learn a new skill, or switch up your routine.",
        "Track your baseline — take the full assessment so you have a reference point to compare against over time.",
      ],
    },
    baseline: {
      eyebrow: "Your baseline so far",
      h2Lead: "You've only covered ",
      h2Gradient: "2 out of 5",
      paragraphs: [
        "The speed game and your quiz answers gave us two axes — speed and risk.",
        "But your brain doesn't work on two dimensions. Memory, attention, and executive function each tell a different story, and you can score well on one while struggling with another.",
        "The full test fills in the rest, so your recommendations actually match your brain.",
      ],
    },
    product: OPTIMIZER_PRODUCT,
    closing: {
      quote: [
        "Tomorrow's meeting is a tough one, and if I don't have my attention covered, I can't perform well. Thanks to checking my brain, I'm aware of how to optimize it now. Glad I found ReCOGnAIze!",
      ],
      attribution: ({ ageLabel }) =>
        ageLabel ? `— Chelsea, aged ${ageLabel} like you` : "— Chelsea, similar age as you",
    },
    exit: {
      body: "Your score is already in your inbox, along with a short set of strategies for pushing it up.",
      body2:
        "When you're ready to test the remaining three brain domains, you know where we are.",
    },
  },

  "optimizer-weak": {
    hero: {
      eyebrow: "Reaction time challenge",
      h1Kind: "plain",
      h1: ({ name }) => withName(name, "most people were faster than you today."),
      sub: ({ avgSeconds, percentile, domain }) =>
        avgSeconds
          ? `${avgSeconds} seconds on average — the bottom ${percentile}% of your age band.`
          : `That is the bottom ${percentile}% of your age band on ${domain}.`,
      scrollCue: "Tell me more",
    },
    meaning: {
      intro: "Here's what a faster speed would unlock:",
      perks: SPEED_PERKS,
      accent: WEAK_ACCENT,
    },
    tip: {
      h2: ({ name }) =>
        name
          ? `${name}, here's a special tip to optimize your speed`
          : "Here's a special tip to optimize your speed",
      ...SPEED_CHIP,
      headline: "Skim one email and act on it in a single pass.",
      body: "Reps like this sharpen how fast you take things in.",
      shareText:
        "My tip from a 60-second brain speed test: skim one email and act on it in a single pass. Try yours:",
    },
    risk: {
      body: OPTIMIZER_RISK_BODY,
      actionablesIntro: "Here are 3 actionables you can do right now",
      actionables: [
        "Prioritise sleep — aim for 7-9 hours; even one extra hour can sharpen reaction time the next day.",
        "Move for 20 minutes — a brisk walk or any cardio boosts blood flow to the brain and improves processing speed.",
        "Take the full assessment — find out which domain is actually holding you back so you fix the real bottleneck.",
      ],
    },
    baseline: {
      eyebrow: "Your baseline so far",
      h2Lead: "You've only covered ",
      h2Gradient: "2 out of 5",
      paragraphs: [
        "The speed game and your quiz answers gave us two axes: speed and risk. Today speed came in low, and one game on one day is a noisy signal.",
        "Memory, attention and executive function each tell a different story, and you can be slow on speed while strong on all three.",
        "The full test finds which one is actually holding you back, so your strategies target the real bottleneck.",
      ],
    },
    product: OPTIMIZER_PRODUCT,
    closing: {
      quote: [
        "Speed was my worst of the five, which stung. Turns out speed wasn't the problem — my executive function was, and that's why my afternoons fell apart. Fixed the right thing. Glad I found ReCOGnAIze!",
      ],
      attribution: ({ ageLabel }) =>
        ageLabel ? `— Chelsea, aged ${ageLabel} like you` : "— Chelsea, similar age as you",
    },
    exit: {
      body: "Your score is already in your inbox, along with a short set of strategies for pushing it up.",
      body2:
        "When you're ready to find which domain is actually slowing you down, you know where we are.",
    },
  },

  "senior-strong": {
    hero: {
      eyebrow: "Processing speed check",
      h1Kind: "plain",
      h1: ({ name }) => withName(name, "your speed is above average for your age band."),
      sub: ({ avgSeconds, topBand, ageLabel, domain }) => {
        const cohort = ageLabel ? `for ages ${ageLabel}` : "for your age band";
        return avgSeconds
          ? `${avgSeconds} seconds on average — the top ${topBand}% ${cohort}.`
          : `That is the top ${topBand}% ${cohort} on ${domain}.`;
      },
      scrollCue: "What did we measure?",
    },
    meaning: {
      intro: "This is where you notice it in daily life:",
      perks: SPEED_PERKS,
      accent: STRONG_ACCENT,
    },
    tip: {
      h2: ({ name }) =>
        name
          ? `Based on your profile, here's one tip for ${name}`
          : "Based on your profile, here's one tip for you",
      ...MEMORY_CHIP,
      headline: "Recall a friend's kopi order without checking.",
      body: "Small recall like this is your memory at work.",
      shareText:
        "My tip from a 60-second brain speed check: recall a friend's kopi order without checking. Try yours:",
    },
    risk: {
      body: SENIOR_RISK_BODY,
      actionablesIntro: "Here are 3 actionables you can do right now",
      actionables: [
        "Take a gentle walk every day — even 15 minutes helps blood flow to the brain and supports long-term cognitive health.",
        "Stay socially active — regular conversations and group activities keep your brain engaged across multiple domains.",
        "Set a baseline with the full assessment — so you and your doctor have numbers to compare against over time.",
      ],
    },
    baseline: {
      eyebrow: "What we covered today",
      h2Lead: "You've only covered ",
      h2Gradient: "2 of 5",
      paragraphs: [
        "Today's game measured one thing: how fast you take in information and respond. Your quiz answers gave us the second: your risk profile.",
        "Brain health is not one number. Memory, attention and executive function each do a different job, and it is common to be steady in one and slower in another.",
        "The full test covers the remaining three, so what we recommend matches your whole profile.",
      ],
    },
    product: SENIOR_PRODUCT,
    closing: {
      quote: [
        "I kept losing the thread in conversations and blamed my age. The report showed it was my attention that had slipped, not my memory.",
        "Now I know exactly what to work on, and my doctor has the numbers.",
      ],
      attribution: () => "— Siew Ling, 64, similar age as you",
    },
    exit: {
      body: "Your results are already in your inbox, with a plain explanation of every score.",
      body2:
        "When you're ready to check the remaining three domains, we'll be here. You can bring the report to your doctor.",
    },
  },

  "senior-weak": {
    hero: {
      eyebrow: "Processing speed check",
      h1Kind: "plain",
      h1: ({ name }) => withName(name, "your speed came in below your age band today."),
      sub: ({ avgSeconds }) =>
        avgSeconds
          ? `${avgSeconds} seconds on average. One game on one day is not a diagnosis.`
          : "One game on one day is not a diagnosis.",
      scrollCue: "What did we measure?",
    },
    meaning: {
      intro: "A slower speed often shows up like this:",
      perks: SPEED_STRUGGLES,
      accent: WEAK_ACCENT,
    },
    tip: {
      h2: () => "Based on your profile, here's one thing to practise",
      ...SPEED_CHIP,
      headline: "Read one page, then say the main idea out loud.",
      body: "Small drills like this train how fast you take things in.",
      shareText:
        "My tip from a 60-second brain speed check: read one page, then say the main idea out loud. Try yours:",
    },
    risk: {
      body: SENIOR_RISK_BODY,
      actionablesIntro: "Here are 3 actionables you can do right now",
      actionables: [
        "Take a gentle walk every day — even 15 minutes helps blood flow to the brain and supports thinking speed.",
        "Keep a simple routine — regular meals, consistent sleep, and familiar structure all reduce cognitive load.",
        "Take the full assessment — share the results with your doctor so they have numbers to work with, not just symptoms.",
      ],
    },
    baseline: {
      eyebrow: "What we covered today",
      h2Lead: "You've only covered ",
      h2Gradient: "2 of 5",
      paragraphs: [
        "Today's game measured one thing: how fast you take in information and respond. A slower result on a single day can come from tiredness, medication, or simply an unfamiliar game.",
        "Memory, attention and executive function each do a different job, and a slow speed does not tell us how those three are doing.",
        "The full test covers the remaining three, so you and your doctor see the whole picture instead of one number.",
      ],
    },
    product: SENIOR_PRODUCT,
    closing: {
      quote: [
        "My first score came back slower than I expected, and it worried me.",
        "The full test showed my memory and attention were fine. It was one area, and my doctor had numbers to work with.",
      ],
      attribution: () => "— Siew Ling, 64, similar age as you",
    },
    exit: {
      body: "Your results are in your inbox with a plain explanation of every score.",
      body2:
        "If the slower result worries you, bring the report to your doctor. We'll be here for the other three domains.",
    },
  },
};
