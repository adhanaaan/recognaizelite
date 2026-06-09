/**
 * Brain Health Quiz data model — ported from sibling repo b2cfunnel
 * (`src/types/question.ts` + `src/types/engine.ts`). Combined into one
 * module so the import surface in recognaize stays small.
 *
 * Treated as the single source of truth for the quiz; both the question
 * bank (`src/data/brainHealthQuestions.ts`) and the scoring engine
 * (`src/lib/brainHealthScoring.ts`) consume these types.
 */

export type Axis = "risk" | "symptom" | "meta";

export type QuestionType = "single-select" | "multi-select" | "number";

export type CitationTag =
  | "lancet2024"
  | "caide"
  | "scd"
  | "straw10"
  | "salthouse"
  | "imhWise"
  | "whitehall"
  | null;

export type PersonaSignal =
  | "caregiver"
  | "perimenopausal"
  | "highPerformer"
  | "neutral";

export interface QuestionOption {
  id: string;
  label: string;
  score: number;
  personaSignal?: PersonaSignal;
}

export interface ShowCondition {
  questionId: string;
  equals: string | string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  axis: Axis;
  prompt: string;
  helpText?: string;
  options?: QuestionOption[];
  showIf?: ShowCondition;
  citation?: CitationTag;
  multiSelect?: boolean;
}

export type AnswerValue = string | number | string[];
export type Answers = Record<string, AnswerValue>;

export type Persona = PersonaSignal;
export type BandName = "low" | "moderate" | "elevated" | "high";

export interface Band {
  name: BandName;
  totalMin: number;
  totalMax: number;
  colour: string;
  order: number;
}

export interface DrivingFactor {
  id: string;
  label: string;
  axis: "risk";
}

export interface ScoreResult {
  riskScore: number;
  symptomScore: number;
  total: number;
  maxTotal: number;
  band: BandName;
  bandFromTotal: BandName;
  riskBand: BandName;
  symptomBand: BandName;
  drivingFactors: DrivingFactor[];
  persona: Persona;
  safetyOverrideApplied: boolean;
}
