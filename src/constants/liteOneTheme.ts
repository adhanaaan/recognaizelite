/**
 * Game-side tokens for the ReCOGnAIze Lite funnel (/lite-one).
 *
 * The lite pages themselves use the Tailwind `quiz*` scale directly. The
 * Symbol Matching game components, though, set colours through inline
 * `style` (they predate the Clinical Empathy palette), so the same values
 * are mirrored here as plain strings and referenced from the one extra
 * ternary arm each of those files gained.
 */
export const LITE = {
  /** quizPrimary */
  accent: "#f77528",
  accentDeep: "#b8480f",
  /** quizSurface */
  surface: "#fff8f6",
  /** quizSecondary — body copy on cream */
  ink: "#7d5747",
  charcoal: "#2d2d2d",
  onAccent: "#ffffff",

  /** Full-bleed game background. */
  bg: "radial-gradient(#fff4ee, #fbe7de)",
  /** Halo behind the prompt symbol. */
  glowMobile: "radial-gradient(circle 60px, rgba(247,117,40,0.10), transparent)",
  glowDesktop: "radial-gradient(circle 120px, rgba(247,117,40,0.10), transparent)",

  /** Number pad buttons. */
  padGradient: "linear-gradient(180deg, #f77528 0%, #b8480f 100%)",
  /** Reference-icon panel glass. */
  panelGlass:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 244, 238, 0.55) 50.99%, rgba(251, 231, 222, 0.35) 100%)",
} as const;
