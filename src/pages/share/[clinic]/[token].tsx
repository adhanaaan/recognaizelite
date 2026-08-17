import Head from "next/head";
import { GetServerSideProps } from "next";
import { useEffect, useMemo } from "react";
import { getSupabaseAdmin, LeadRow, PartnerShareLinkRow } from "src/utils/supabase";
import { fetchClinicLeads, KNOWN_CLINICS, LeadStats } from "src/server/leadAggregation";

type Status = "active" | "revoked" | "not_found";

interface BrandTheme {
  name: string;
  partnerLogoSrc: string | null;
  partnerLogoAlt: string;
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textMuted: string;
  accent: string;       // primary brand sage/jade
  accentDark: string;   // deeper paired tone
  pillBg: string;
  pillText: string;
  hideBreakdownGender?: boolean;
}

const BRAND: Record<string, BrandTheme> = {
  hookikigai: {
    name: "Hookikigai · Ikigai Medical",
    partnerLogoSrc: "/ikigai-logo.png",
    partnerLogoAlt: "Ikigai Medical",
    pageBg: "linear-gradient(180deg, #F8F9FB 0%, #EEF1F5 100%)",
    cardBg: "#ffffff",
    cardBorder: "#E2E6EE",
    textPrimary: "#0F172A",
    textMuted: "#475569",
    accent: "#3BB8B0",
    accentDark: "#1A7A74",
    pillBg: "rgba(59,184,176,0.12)",
    pillText: "#1A7A74",
  },
  sjmc: {
    name: "SJMC · World Health Day",
    partnerLogoSrc: null,
    partnerLogoAlt: "SJMC",
    pageBg: "linear-gradient(180deg, #FAEEE6 0%, #FFFFFF 100%)",
    cardBg: "#ffffff",
    cardBorder: "#E5D5CA",
    textPrimary: "#1F2937",
    textMuted: "#6B7280",
    accent: "#E8793B",
    accentDark: "#C25D27",
    pillBg: "rgba(232,121,59,0.12)",
    pillText: "#C25D27",
  },
  healthtechx: {
    name: "HealthTechX · AI Wellness",
    partnerLogoSrc: "/aiwellness-logo.jpeg",
    partnerLogoAlt: "AI Wellness",
    pageBg: "linear-gradient(180deg, #FBF8F3 0%, #F2EBDF 100%)",
    cardBg: "#ffffff",
    cardBorder: "#B8D2C7",
    textPrimary: "#1F362D",
    textMuted: "#4B5563",
    accent: "#7AB5A7",
    accentDark: "#2C4A3F",
    pillBg: "rgba(122,181,167,0.15)",
    pillText: "#2C4A3F",
    hideBreakdownGender: true,
  },
  tcmbrain: {
    name: "TCM Brain · AI Wellness",
    partnerLogoSrc: "/aiwellness-logo.jpeg",
    partnerLogoAlt: "AI Wellness",
    pageBg: "linear-gradient(180deg, #FBF8F3 0%, #F2EBDF 100%)",
    cardBg: "#ffffff",
    cardBorder: "#B8D2C7",
    textPrimary: "#1F362D",
    textMuted: "#4B5563",
    accent: "#7AB5A7",
    accentDark: "#2C4A3F",
    pillBg: "rgba(122,181,167,0.15)",
    pillText: "#2C4A3F",
  },
  liteone: {
    name: "BrainScan Testing",
    partnerLogoSrc: null,
    partnerLogoAlt: "BrainScan Testing",
    pageBg: "linear-gradient(180deg, #fff4ee 0%, #FFFFFF 100%)",
    cardBg: "#ffffff",
    cardBorder: "#d8c2b9",
    textPrimary: "#2d2d2d",
    textMuted: "#7d5747",
    accent: "#f77528",
    accentDark: "#b8480f",
    pillBg: "rgba(247,117,40,0.12)",
    pillText: "#b8480f",
  },
  // Same palette as liteone — it is the same product, shown to a campaign
  // audience. Only the name distinguishes the two on a partner's screen.
  liteworldalz: {
    name: "BrainScan Testing · World Alzheimer's Month",
    partnerLogoSrc: null,
    partnerLogoAlt: "BrainScan Testing",
    pageBg: "linear-gradient(180deg, #fff4ee 0%, #FFFFFF 100%)",
    cardBg: "#ffffff",
    cardBorder: "#d8c2b9",
    textPrimary: "#2d2d2d",
    textMuted: "#7d5747",
    accent: "#f77528",
    accentDark: "#b8480f",
    pillBg: "rgba(247,117,40,0.12)",
    pillText: "#b8480f",
  },
  novi: {
    name: "NOVI Health",
    partnerLogoSrc: null,
    partnerLogoAlt: "NOVI Health",
    pageBg: "linear-gradient(180deg, #FFF9ED 0%, #FFFFFF 100%)",
    cardBg: "#ffffff",
    cardBorder: "#E8DCC8",
    textPrimary: "#1F2937",
    textMuted: "#6B7280",
    accent: "#EBB02D",
    accentDark: "#C8960F",
    pillBg: "rgba(235,176,45,0.12)",
    pillText: "#C8960F",
  },
};

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
};
const HEALTH_GOAL_LABELS: Record<string, string> = {
  stay_sharp: "Stay sharp",
  improve_focus: "Focus & memory",
  prevent_decline: "Prevent decline",
  longevity: "Longevity",
};
const ROLE_LABELS: Record<string, string> = {
  clinician: "Clinician",
  executive: "Executive",
  investor: "Investor",
  pharma: "Pharma",
  vendor: "Vendor",
  researcher: "Researcher",
  press: "Press",
  other: "Other",
};

interface PageProps {
  status: Status;
  clinic: string;
  label: string | null;
  leads: LeadRow[];
  stats: LeadStats;
  loadedAt: string;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ params }) => {
  const clinic = typeof params?.clinic === "string" ? params.clinic : "";
  const token = typeof params?.token === "string" ? params.token : "";

  const baseEmpty: Omit<PageProps, "status"> = {
    clinic,
    label: null,
    leads: [],
    stats: { total: 0, today: 0, avgScore: null, byGender: {}, byAgeRange: {}, withContact: 0 },
    loadedAt: new Date().toISOString(),
  };

  if (!(KNOWN_CLINICS as readonly string[]).includes(clinic) || !token) {
    return { props: { status: "not_found", ...baseEmpty } };
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return { props: { status: "not_found", ...baseEmpty } };
  }

  const { data: link, error } = await supabase
    .from("partner_share_links")
    .select("*")
    .eq("token", token)
    .eq("clinic", clinic)
    .maybeSingle();

  const linkRow = (link ?? null) as PartnerShareLinkRow | null;
  if (error || !linkRow) {
    return { props: { status: "not_found", ...baseEmpty } };
  }
  if (linkRow.revoked_at) {
    return {
      props: {
        status: "revoked",
        ...baseEmpty,
        label: linkRow.label ?? null,
      },
    };
  }

  // Touch last_accessed_at; fire-and-forget — we don't want a slow update
  // to block rendering.
  void supabase
    .from("partner_share_links")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("id", linkRow.id);

  try {
    const { leads, stats } = await fetchClinicLeads(clinic);
    return {
      props: {
        status: "active",
        clinic,
        label: linkRow.label ?? null,
        leads,
        stats,
        loadedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    console.error("Share page failed to load leads:", err);
    return { props: { status: "not_found", ...baseEmpty } };
  }
};

function StatTile({ label, value, theme }: { label: string; value: string | number; theme: BrandTheme }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: theme.textMuted }}>
        {label}
      </div>
      <div className="mt-1 text-[22px] font-bold" style={{ color: theme.textPrimary }}>
        {value}
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  data,
  total,
  labels,
  theme,
}: {
  title: string;
  data: Record<string, number>;
  total: number;
  labels?: Record<string, string>;
  theme: BrandTheme;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: theme.textMuted }}>
        {title}
      </div>
      {entries.length === 0 ? (
        <div className="text-[13px]" style={{ color: theme.textMuted }}>
          No data yet
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(([key, count]) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-[12px] mb-0.5" style={{ color: theme.textMuted }}>
                  <span>{labels?.[key] ?? key}</span>
                  <span>{count} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.pillBg }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: theme.accent }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function topKey(data: Record<string, number>): string | null {
  let best: string | null = null;
  let bestCount = -1;
  for (const [k, v] of Object.entries(data)) {
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  }
  return best;
}

function RevokedOrNotFound({ status }: { status: "revoked" | "not_found" }) {
  return (
    <>
      <Head>
        <title>Link no longer active | ReCOGnAIze</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div
        className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ background: "linear-gradient(180deg, #F8F9FB 0%, #EEF1F5 100%)" }}
      >
        <div
          className="max-w-md w-full rounded-2xl p-8 text-center"
          style={{ backgroundColor: "#ffffff", border: "1px solid #E2E6EE" }}
        >
          <img src="/logo.png" alt="ReCOGnAIze" className="mx-auto w-[44px] mb-4" />
          <h1 className="text-[20px] font-bold text-[#0F172A]" style={{ fontFamily: "Georgia, serif" }}>
            {status === "revoked" ? "This link has been revoked." : "Link not active."}
          </h1>
          <p className="mt-3 text-[14px] text-[#475569] leading-relaxed">
            Please contact your ReCOGnAIze contact to receive an updated link.
          </p>
        </div>
      </div>
    </>
  );
}

export default function PartnerSharePage({ status, clinic, label, leads, stats, loadedAt }: PageProps) {
  // Override the global html/body/__next overflow:hidden lock (set by
  // styles/globals.css so the game pages can keep the viewport pinned).
  // All five other long-content report pages use this same pattern.
  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    const next = document.getElementById("__next");
    if (next) { next.style.overflow = "auto"; next.style.height = "auto"; }
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
      if (next) { next.style.overflow = ""; next.style.height = ""; }
    };
  }, []);

  const topAge = useMemo(() => topKey(stats.byAgeRange) ?? "—", [stats.byAgeRange]);

  if (status !== "active") {
    return <RevokedOrNotFound status={status} />;
  }

  const theme = BRAND[clinic] ?? BRAND.hookikigai;
  const isHealthtechx = clinic === "healthtechx";
  const isTcm = clinic === "tcmbrain";
  const isB2C = clinic === "sjmc" || clinic === "hookikigai" || clinic === "tcmbrain";

  return (
    <>
      <Head>
        <title>{theme.name} · Leads | ReCOGnAIze</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <div className="min-h-screen w-full px-4 py-8 sm:px-8" style={{ background: theme.pageBg }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src="/logo.png" alt="ReCOGnAIze" className="w-[28px] h-[28px]" />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: theme.textMuted }}
                >
                  ReCOGnAIze
                </span>
                {theme.partnerLogoSrc && (
                  <>
                    <span style={{ color: theme.textMuted }}>×</span>
                    <img
                      src={theme.partnerLogoSrc}
                      alt={theme.partnerLogoAlt}
                      className="h-[28px] rounded"
                    />
                  </>
                )}
              </div>
              <h1
                className="text-[26px] sm:text-[32px] font-bold leading-tight"
                style={{ color: theme.textPrimary, fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {theme.name} · Leads
              </h1>
              {label && (
                <p className="text-[13px] mt-1" style={{ color: theme.textMuted }}>
                  Shared with {label}
                </p>
              )}
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px]"
              style={{ backgroundColor: theme.pillBg, color: theme.pillText }}
            >
              <span className="inline-block size-2 rounded-full" style={{ backgroundColor: theme.accent }} />
              Live · last loaded {formatDate(loadedAt)}
            </div>
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <StatTile label="Total leads" value={stats.total} theme={theme} />
            <StatTile label="Today" value={stats.today} theme={theme} />
            <StatTile
              label="Avg score"
              value={stats.avgScore !== null ? stats.avgScore : "—"}
              theme={theme}
            />
            <StatTile label="Top age" value={topAge} theme={theme} />
          </div>

          {/* Breakdown */}
          {stats.total > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {!theme.hideBreakdownGender && (
                <BreakdownCard
                  title="By gender"
                  data={stats.byGender}
                  total={stats.total}
                  labels={GENDER_LABELS}
                  theme={theme}
                />
              )}
              <BreakdownCard
                title="By age range"
                data={stats.byAgeRange}
                total={stats.total}
                theme={theme}
              />
            </div>
          )}

          {/* Lead table */}
          {leads.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textMuted }}
            >
              No leads yet.
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-x-auto"
              style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
            >
              <table className="w-full text-left">
                <thead>
                  <tr style={{ backgroundColor: theme.pillBg }}>
                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>#</th>
                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Email</th>
                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>WhatsApp</th>
                    {isHealthtechx ? (
                      <>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Role</th>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Organization</th>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Interest</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Age</th>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Gender</th>
                      </>
                    )}
                    {isTcm && (
                      <>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Damp</th>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Blood Stasis</th>
                      </>
                    )}
                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Score</th>
                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Severity</th>
                    {isB2C && !isTcm && (
                      <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Goal</th>
                    )}
                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: theme.pillText }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr
                      key={lead.id}
                      style={{
                        backgroundColor: i % 2 === 0 ? theme.cardBg : theme.pageBg,
                        borderTop: `1px solid ${theme.cardBorder}`,
                      }}
                    >
                      <td className="px-3 py-2 text-[12px] whitespace-nowrap" style={{ color: theme.textMuted }}>{i + 1}</td>
                      <td className="px-3 py-2 text-[13px] font-medium whitespace-nowrap" style={{ color: theme.textPrimary }}>{lead.email}</td>
                      <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ color: theme.textPrimary }}>
                        {lead.whatsapp ? (
                          <a
                            href={`https://wa.me/${lead.whatsapp.replace(/^\+/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: theme.accentDark }}
                          >
                            {lead.whatsapp}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      {isHealthtechx ? (
                        <>
                          <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ color: theme.textPrimary }}>
                            {lead.role ? ROLE_LABELS[lead.role] ?? lead.role : "—"}
                          </td>
                          <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ color: theme.textPrimary }}>
                            {lead.organization ?? "—"}
                          </td>
                          <td
                            className="px-3 py-2 text-[12.5px] max-w-[260px] truncate"
                            style={{ color: theme.textPrimary }}
                            title={lead.cognitive_interest ?? undefined}
                          >
                            {lead.cognitive_interest ?? "—"}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ color: theme.textPrimary }}>{lead.age_range ?? "—"}</td>
                          <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ color: theme.textPrimary }}>
                            {lead.gender ? GENDER_LABELS[lead.gender] ?? lead.gender : "—"}
                          </td>
                        </>
                      )}
                      {isTcm && (
                        <>
                          <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ color: theme.textPrimary }}>{lead.dampness_index ?? "—"}</td>
                          <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ color: theme.textPrimary }}>{lead.blood_stasis_index ?? "—"}</td>
                        </>
                      )}
                      <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ color: theme.textPrimary }}>{lead.score ?? "—"}</td>
                      <td className="px-3 py-2 text-[12.5px] capitalize whitespace-nowrap" style={{ color: theme.textPrimary }}>{lead.severity ?? "—"}</td>
                      {isB2C && !isTcm && (
                        <td className="px-3 py-2 text-[12.5px] whitespace-nowrap" style={{ color: theme.textPrimary }}>
                          {lead.health_goal ? HEALTH_GOAL_LABELS[lead.health_goal] ?? lead.health_goal : "—"}
                        </td>
                      )}
                      <td className="px-3 py-2 text-[12px] whitespace-nowrap" style={{ color: theme.textMuted }}>{formatDate(lead.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-[11px]" style={{ color: theme.textMuted }}>
            Generated {formatDate(loadedAt)} · ReCOGnAIze · Confidential — for partner use only.
          </p>
        </div>
      </div>
    </>
  );
}
