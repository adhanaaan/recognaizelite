import { QUESTIONS_BY_ID } from "src/data/brainHealthQuestions";
import { QUESTIONS_MS_BY_ID } from "src/data/brainHealthQuestions.ms";
import { QUESTIONS_ZH_BY_ID } from "src/data/brainHealthQuestions.zh";
import type { LiteEventLang } from "src/i18n/liteEvent";
import type { Question } from "src/types/quiz";

/**
 * The question banks /lite-event-template asks from: the shared banks, with the
 * template's own wording changes layered on top.
 *
 * Only wording is overridden here. Question ids, option ids and scores are the
 * shared ones untouched, so `computeScore` grades a template run exactly as it
 * grades a /lite-event run and the answers written to liteevent_leads stay
 * comparable across both funnels and all three languages.
 */

/** Reworded prompts/help text, per language, keyed by question id. */
const OVERRIDES: Partial<Record<LiteEventLang, Record<string, Partial<Question>>>> = {
  zh: {
    // "半品脱" is the literal half-pint of the English original, but a pint is
    // not a measure anyone pours by in Chinese and readers stumbled on it at a
    // booth. A bottle is the unit a Mandarin speaker actually counts beer in.
    alcohol: { helpText: "1 杯约等于 1 小杯葡萄酒、半瓶啤酒或 1 杯烈酒。" },
  },
};

function withOverrides(
  bank: Record<string, Question>,
  overrides: Record<string, Partial<Question>> | undefined
): Record<string, Question> {
  if (!overrides) return bank;
  const next = { ...bank };
  for (const [id, patch] of Object.entries(overrides)) {
    // A typo in an id would otherwise invent a question with no options, which
    // renders as an unanswerable row rather than failing loudly.
    if (!next[id]) throw new Error(`liteEventTemplateQuestions: unknown question id "${id}"`);
    next[id] = { ...next[id], ...patch };
  }
  return next;
}

export const LITE_EVENT_TEMPLATE_QUESTION_BANKS: Record<
  LiteEventLang,
  Record<string, Question>
> = {
  en: withOverrides(QUESTIONS_BY_ID, OVERRIDES.en),
  zh: withOverrides(QUESTIONS_ZH_BY_ID, OVERRIDES.zh),
  ms: withOverrides(QUESTIONS_MS_BY_ID, OVERRIDES.ms),
};
