/**
 * Copy and citations for the /lite-clinician funnel.
 *
 * The consumer funnels lead with a hook ("You tracked everything. What about
 * your brain?"), press logos and a discount. None of that persuades a
 * clinician, and some of it actively costs credibility. This funnel states
 * what the instrument is, what it measures, and where it was validated — and
 * lets the citations do the work.
 *
 * Every claim a clinician reads lives in this file rather than scattered
 * through markup, so the set can be checked against the papers in one pass.
 * Figures are reproduced from the published abstracts; verify before editing.
 */

export type Citation = {
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi: string;
  url: string;
  /** One line on why this citation is here. */
  note: string;
};

/** The validation study for this instrument. */
export const VALIDATION_PAPER: Citation = {
  title:
    "ReCOGnAIze app to detect vascular cognitive impairment and mild cognitive impairment",
  authors: "Mohammed AA, et al.",
  journal: "Alzheimer's & Dementia",
  year: "2026",
  doi: "10.1002/alz.70992",
  url: "https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz.70992",
  note: "Validation of the assessment this task is drawn from.",
};

/** The cohort the instrument was developed and validated in. */
export const COHORT_PAPER: Citation = {
  title:
    "Biomarkers and Cognition Study, Singapore (BIOCIS): Protocol, Study Design, and Preliminary Findings",
  authors: "Chong JR, et al.",
  journal: "The Journal of Prevention of Alzheimer's Disease",
  year: "2024",
  doi: "10.14283/jpad.2024.89",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11266377/",
  note: "The cohort: 2,500 participants aged 30–95, assessed annually over five years.",
};

export const CITATIONS: Citation[] = [VALIDATION_PAPER, COHORT_PAPER];

export const INSTITUTION =
  "Dementia Research Centre · Lee Kong Chian School of Medicine, NTU Singapore";

/**
 * Headline performance figures. Reproduced from the validation paper's
 * abstract — these are claims made to clinicians in writing, so check them
 * against the paper before changing anything here.
 */
export const PERFORMANCE = [
  { value: "0.85", caption: "AUC — vascular cognitive impairment" },
  { value: "0.90", caption: "AUC — mild cognitive impairment" },
] as const;

/**
 * What the visitor is about to do, described as a protocol rather than as a
 * sequence of things to enjoy.
 */
export const PROTOCOL = [
  {
    label: "Symbol–digit substitution",
    detail: "60 seconds. Indexes processing speed.",
  },
  {
    label: "Modifiable risk factor questionnaire",
    detail: "Structured on the 2024 Lancet Commission risk factors.",
  },
  {
    label: "Age-referenced percentile",
    detail: "Your score against an age-matched reference distribution.",
  },
] as const;

/** Stated plainly, because a clinician will ask it before they trust a number. */
export const SCOPE_NOTE =
  "This is a single-domain screen, not a diagnostic instrument. It samples processing speed only; the full assessment covers memory, attention and executive function alongside it.";
