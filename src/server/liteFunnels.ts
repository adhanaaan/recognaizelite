/**
 * The registry of lite funnels, server side.
 *
 * Each lite funnel — /lite-one and its copies — owns a Supabase table with an
 * identical column layout, so every server path that touches one differs only
 * in which table it writes to. This map is that difference, in one place:
 * /api/lite-attempt and /api/save-lead both resolve through it, and adding a
 * funnel is a single line rather than a hunt through the API routes for the
 * two places the old copy-pasted map happened to live.
 *
 * The client-side counterpart is LITE_VARIANTS in src/utils/liteOne.ts, which
 * carries the routes, storage namespace and default campaign. The keys here
 * must match the `clinic` values there.
 */
export const LITE_TABLES: Record<string, string> = {
  liteone: "liteone_leads",
  liteworldalz: "liteworldalz_leads",
  liteclinician: "liteclinician_leads",
  litetwo: "litetwo_leads",
  act4health: "act4health_leads",
  litebcgolf: "litebcgolf_leads",
  liteevent: "liteevent_leads",
};

/** Table for a lite clinic, or null if the clinic isn't a lite funnel. */
export function liteTableFor(clinic: string | null | undefined): string | null {
  if (!clinic) return null;
  return LITE_TABLES[clinic] ?? null;
}
