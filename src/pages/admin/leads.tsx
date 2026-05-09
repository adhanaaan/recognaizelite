import Head from "next/head";
import Router from "next/router";
import { GetServerSideProps } from "next";
import { useEffect, useMemo, useState } from "react";
import { verifyAdminCookie } from "src/utils/adminAuth";
import { AGE_RANGES, GENDERS, LeadRow } from "src/utils/supabase";

interface Stats {
  total: number;
  today: number;
  avgScore: number | null;
  byGender: Record<string, number>;
  byAgeRange: Record<string, number>;
}

interface LeadsResponse {
  leads: LeadRow[];
  stats: Stats;
}

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

const SUPPLEMENT_LABELS: Record<string, string> = {
  yes_regularly: "Yes, regularly",
  occasionally: "Occasionally",
  no_but_interested: "No, interested",
  no: "No",
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!verifyAdminCookie(req)) {
    return {
      redirect: { destination: "/admin/login", permanent: false },
    };
  }
  return { props: {} };
};

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const CLINIC_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "sjmc", label: "SJMC" },
  { value: "hookikigai", label: "Hookikigai" },
  { value: "healthtechx", label: "HealthTechX" },
  { value: "tcmbrain", label: "TCM Brain" },
];

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

const ORG_TYPE_LABELS: Record<string, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  payer: "Payer",
  pharma: "Pharma",
  startup: "Startup",
  academic: "Academic",
  government: "Government",
  other: "Other",
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clinic, setClinic] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [ageFilter, setAgeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Scroll fix
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

  useEffect(() => {
    setLoading(true);
    setError(null);
    const url = clinic ? `/api/leads?clinic=${clinic}` : "/api/leads";
    fetch(url)
      .then(async (res) => {
        if (res.status === 401) {
          Router.replace("/admin/login");
          return null;
        }
        if (!res.ok) throw new Error("Failed to load leads");
        return (await res.json()) as LeadsResponse;
      })
      .then((data) => {
        if (!data) return;
        setLeads(data.leads ?? []);
        setStats(data.stats ?? null);
      })
      .catch(() => setError("Failed to load leads"))
      .finally(() => setLoading(false));
  }, [clinic]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromMs = dateFrom ? new Date(dateFrom + "T00:00:00").getTime() : null;
    const toMs = dateTo ? new Date(dateTo + "T23:59:59").getTime() : null;

    return leads.filter((lead) => {
      if (q && !lead.email.toLowerCase().includes(q)) return false;
      if (genderFilter && lead.gender !== genderFilter) return false;
      if (ageFilter && lead.age_range !== ageFilter) return false;
      if (fromMs || toMs) {
        const ms = new Date(lead.created_at).getTime();
        if (fromMs && ms < fromMs) return false;
        if (toMs && ms > toMs) return false;
      }
      return true;
    });
  }, [leads, search, genderFilter, ageFilter, dateFrom, dateTo]);

  const downloadCSV = () => {
    const header = [
      "Email",
      "Clinic",
      "Age",
      "Gender",
      "Role",
      "Organization",
      "Org Type",
      "Cognitive Interest",
      "Dampness Index",
      "Blood Stasis Index",
      "Score",
      "Percentile",
      "Severity",
      "Health Goal",
      "Supplements",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Referrer",
      "Region",
      "Created",
    ];
    const rows = filtered.map((l) =>
      [
        l.email,
        l.clinic,
        l.age_range,
        l.gender,
        l.role,
        l.organization,
        l.organization_type,
        l.cognitive_interest,
        l.dampness_index,
        l.blood_stasis_index,
        l.score,
        l.percentile,
        l.severity,
        l.health_goal,
        l.takes_supplements,
        l.utm_source,
        l.utm_medium,
        l.utm_campaign,
        l.referrer,
        l.ip_region,
        l.created_at,
      ]
        .map(csvEscape)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clinic || "all"}-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    Router.replace("/admin/login");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <Head>
        <title>Leads — Admin</title>
        <meta name="theme-color" content="#0B0F1A" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div
        className="min-h-screen w-full px-4 py-8 sm:px-8"
        style={{ background: "linear-gradient(180deg, #0B0F1A 0%, #101828 50%, #0B0F1A 100%)" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-white text-[24px] font-bold">
                {clinic ? CLINIC_OPTIONS.find((c) => c.value === clinic)!.label : "All"} Leads
              </h1>
              <p className="text-gray-500 text-[13px] mt-1">
                {filtered.length} of {leads.length} shown
              </p>
            </div>
            <div className="flex gap-2">
              {filtered.length > 0 && (
                <button
                  onClick={downloadCSV}
                  className="rounded-full px-4 py-2 text-[12px] font-bold text-[#0B0F1A]"
                  style={{ backgroundColor: "#5CE0D8" }}
                >
                  Export CSV
                </button>
              )}
              <button
                onClick={logout}
                className="rounded-full px-4 py-2 text-[12px] font-semibold text-gray-300 border border-gray-700"
              >
                Log out
              </button>
            </div>
          </div>

          {/* Clinic toggle */}
          <div className="flex gap-2 mb-6">
            {CLINIC_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setClinic(opt.value)}
                className="rounded-full px-4 py-2 text-[12px] font-bold transition-colors"
                style={
                  clinic === opt.value
                    ? { backgroundColor: "#5CE0D8", color: "#0B0F1A" }
                    : { backgroundColor: "#111827", color: "#9CA3AF", border: "1px solid #1F2937" }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total leads" value={stats.total} />
              <StatCard label="Today" value={stats.today} />
              <StatCard
                label="Avg score"
                value={stats.avgScore !== null ? stats.avgScore : "—"}
              />
              <StatCard
                label="Top age"
                value={topKey(stats.byAgeRange) ?? "—"}
              />
            </div>
          )}

          {/* Breakdown bars */}
          {stats && (stats.total > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <BreakdownCard title="By gender" data={stats.byGender} labels={GENDER_LABELS} total={stats.total} />
              <BreakdownCard title="By age range" data={stats.byAgeRange} total={stats.total} />
            </div>
          )}

          {/* Filters */}
          <div className="rounded-xl border border-gray-800 bg-[#0D1320] p-3 sm:p-4 mb-4 grid grid-cols-1 sm:grid-cols-5 gap-2">
            <input
              type="text"
              placeholder="Search email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:col-span-2 rounded-lg bg-[#111827] border border-gray-800 px-3 py-2 text-[13px] text-white placeholder-gray-500 outline-none focus:border-[#5CE0D8]"
            />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="rounded-lg bg-[#111827] border border-gray-800 px-3 py-2 text-[13px] text-white outline-none focus:border-[#5CE0D8]"
            >
              <option value="">All genders</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {GENDER_LABELS[g]}
                </option>
              ))}
            </select>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="rounded-lg bg-[#111827] border border-gray-800 px-3 py-2 text-[13px] text-white outline-none focus:border-[#5CE0D8]"
            >
              <option value="">All ages</option>
              {AGE_RANGES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg bg-[#111827] border border-gray-800 px-2 py-2 text-[12px] text-white outline-none focus:border-[#5CE0D8]"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg bg-[#111827] border border-gray-800 px-2 py-2 text-[12px] text-white outline-none focus:border-[#5CE0D8]"
              />
            </div>
          </div>

          {loading && <p className="text-gray-400 text-center py-20">Loading…</p>}
          {error && (
            <div className="rounded-2xl border border-red-800 bg-red-900/30 p-6 text-center text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-8 text-center text-gray-400">
              No leads match the current filters.
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="rounded-2xl overflow-x-auto" style={{ border: "1px solid #1F2937" }}>
              <table className="w-full text-left">
                <thead>
                  <tr style={{ backgroundColor: "#111827" }}>
                    <Th>#</Th>
                    <Th>Email</Th>
                    {!clinic && <Th>Clinic</Th>}
                    {clinic === "healthtechx" ? (
                      <>
                        <Th>Role</Th>
                        <Th>Organization</Th>
                        <Th>Org Type</Th>
                        <Th>Interest</Th>
                      </>
                    ) : (
                      <>
                        <Th>Age</Th>
                        <Th>Gender</Th>
                      </>
                    )}
                    {clinic === "tcmbrain" && (
                      <>
                        <Th>Dampness</Th>
                        <Th>Blood Stasis</Th>
                      </>
                    )}
                    <Th>Score</Th>
                    <Th>Severity</Th>
                    {clinic !== "healthtechx" && clinic !== "tcmbrain" && (
                      <>
                        <Th>Goal</Th>
                        <Th>Supplements</Th>
                      </>
                    )}
                    <Th>Source</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <tr
                      key={lead.id}
                      style={{
                        backgroundColor: i % 2 === 0 ? "#0D1320" : "#111827",
                        borderTop: "1px solid #1F2937",
                      }}
                    >
                      <Td className="text-gray-600">{i + 1}</Td>
                      <Td className="text-white font-medium">{lead.email}</Td>
                      {!clinic && <Td className="text-gray-300 capitalize">{lead.clinic ?? "—"}</Td>}
                      {clinic === "healthtechx" ? (
                        <>
                          <Td className="text-gray-300">{lead.role ? ROLE_LABELS[lead.role] ?? lead.role : "—"}</Td>
                          <Td className="text-gray-300">{lead.organization ?? "—"}</Td>
                          <Td className="text-gray-300">{lead.organization_type ? ORG_TYPE_LABELS[lead.organization_type] ?? lead.organization_type : "—"}</Td>
                          <Td className="text-gray-300 max-w-[280px] truncate" title={lead.cognitive_interest ?? undefined}>
                            {lead.cognitive_interest ?? "—"}
                          </Td>
                        </>
                      ) : (
                        <>
                          <Td className="text-gray-300">{lead.age_range ?? "—"}</Td>
                          <Td className="text-gray-300">
                            {lead.gender ? GENDER_LABELS[lead.gender] ?? lead.gender : "—"}
                          </Td>
                        </>
                      )}
                      {clinic === "tcmbrain" && (
                        <>
                          <Td className="text-gray-300">{lead.dampness_index ?? "—"}</Td>
                          <Td className="text-gray-300">{lead.blood_stasis_index ?? "—"}</Td>
                        </>
                      )}
                      <Td className="text-gray-300">{lead.score ?? "—"}</Td>
                      <Td className="text-gray-300 capitalize">{lead.severity ?? "—"}</Td>
                      {clinic !== "healthtechx" && clinic !== "tcmbrain" && (
                        <>
                          <Td className="text-gray-300">{lead.health_goal ? HEALTH_GOAL_LABELS[lead.health_goal] ?? lead.health_goal : "—"}</Td>
                          <Td className="text-gray-300">{lead.takes_supplements ? SUPPLEMENT_LABELS[lead.takes_supplements] ?? lead.takes_supplements : "—"}</Td>
                        </>
                      )}
                      <Td className="text-gray-400">{lead.utm_source ?? "—"}</Td>
                      <Td className="text-gray-400">{formatDate(lead.created_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0D1320] p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</div>
      <div className="mt-1 text-[22px] font-bold text-white">{value}</div>
    </div>
  );
}

function BreakdownCard({
  title,
  data,
  total,
  labels,
}: {
  title: string;
  data: Record<string, number>;
  total: number;
  labels?: Record<string, string>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0D1320] p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">{title}</div>
      {entries.length === 0 ? (
        <div className="text-[13px] text-gray-500">No data yet</div>
      ) : (
        <div className="space-y-2">
          {entries.map(([key, count]) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-[12px] text-gray-400 mb-0.5">
                  <span>{labels?.[key] ?? key}</span>
                  <span>{count} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: "#5CE0D8" }}
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td className={`px-4 py-3 text-[13px] whitespace-nowrap ${className}`} title={title}>
      {children}
    </td>
  );
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
