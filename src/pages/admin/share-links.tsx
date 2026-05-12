import Head from "next/head";
import Router from "next/router";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { verifyAdminCookie } from "src/utils/adminAuth";
import { PartnerShareLinkRow } from "src/utils/supabase";

const CLINIC_OPTIONS: { value: string; label: string }[] = [
  { value: "sjmc", label: "SJMC" },
  { value: "hookikigai", label: "Hookikigai" },
  { value: "healthtechx", label: "HealthTechX" },
  { value: "tcmbrain", label: "TCM Brain" },
];

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!verifyAdminCookie(req)) {
    return {
      redirect: { destination: "/admin/login", permanent: false },
    };
  }
  return { props: {} };
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildShareUrl(link: PartnerShareLinkRow): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/share/${link.clinic}/${link.token}`;
}

export default function AdminShareLinksPage() {
  const [links, setLinks] = useState<PartnerShareLinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newClinic, setNewClinic] = useState("hookikigai");
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/share-links");
      if (res.status === 401) {
        Router.replace("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setLinks(data.links ?? []);
    } catch {
      setError("Failed to load share links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic: newClinic, label: newLabel.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to create link");
      }
      setNewLabel("");
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string, currentlyRevoked: boolean) => {
    const verb = currentlyRevoked ? "reinstate" : "revoke";
    if (!confirm(`Are you sure you want to ${verb} this link?`)) return;
    try {
      const res = await fetch(`/api/admin/share-links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: verb }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await refresh();
    } catch {
      setError("Failed to update link");
    }
  };

  const handleCopy = async (link: PartnerShareLinkRow) => {
    const url = buildShareUrl(link);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    Router.replace("/admin/login");
  };

  return (
    <>
      <Head>
        <title>Share links — Admin</title>
        <meta name="theme-color" content="#0B0F1A" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div
        className="min-h-screen w-full px-4 py-8 sm:px-8"
        style={{ background: "linear-gradient(180deg, #0B0F1A 0%, #101828 50%, #0B0F1A 100%)" }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-white text-[24px] font-bold">Partner share links</h1>
              <p className="text-gray-500 text-[13px] mt-1">
                Tokenized URLs you send to partners so they can view their leads.
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/leads"
                className="rounded-full px-4 py-2 text-[12px] font-semibold text-gray-300 border border-gray-700"
              >
                Back to leads
              </a>
              <button
                onClick={logout}
                className="rounded-full px-4 py-2 text-[12px] font-semibold text-gray-300 border border-gray-700"
              >
                Log out
              </button>
            </div>
          </div>

          {/* Create form */}
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-gray-800 bg-[#0D1320] p-4 mb-6 grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-3"
          >
            <select
              value={newClinic}
              onChange={(e) => setNewClinic(e.target.value)}
              className="rounded-lg bg-[#111827] border border-gray-800 px-3 py-2 text-[13px] text-white outline-none focus:border-[#5CE0D8]"
            >
              {CLINIC_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Label (e.g. Shantal — Ikigai)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              maxLength={120}
              className="rounded-lg bg-[#111827] border border-gray-800 px-3 py-2 text-[13px] text-white placeholder-gray-500 outline-none focus:border-[#5CE0D8]"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-full px-5 py-2 text-[12px] font-bold text-[#0B0F1A] disabled:opacity-60"
              style={{ backgroundColor: "#5CE0D8" }}
            >
              {creating ? "Creating…" : "Create new link"}
            </button>
          </form>

          {error && (
            <div className="rounded-2xl border border-red-800 bg-red-900/30 p-4 text-center text-red-300 mb-4">
              {error}
            </div>
          )}

          {loading && <p className="text-gray-400 text-center py-12">Loading…</p>}

          {!loading && links.length === 0 && (
            <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-8 text-center text-gray-400">
              No share links yet. Use the form above to mint one.
            </div>
          )}

          {!loading && links.length > 0 && (
            <div className="rounded-2xl overflow-x-auto" style={{ border: "1px solid #1F2937" }}>
              <table className="w-full text-left">
                <thead>
                  <tr style={{ backgroundColor: "#111827" }}>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">Clinic</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">Label</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">Created</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">Last access</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link, i) => {
                    const url = buildShareUrl(link);
                    const revoked = !!link.revoked_at;
                    return (
                      <tr
                        key={link.id}
                        style={{
                          backgroundColor: i % 2 === 0 ? "#0D1320" : "#111827",
                          borderTop: "1px solid #1F2937",
                        }}
                      >
                        <td className="px-4 py-3 text-[13px] text-gray-300 capitalize whitespace-nowrap">{link.clinic}</td>
                        <td className="px-4 py-3 text-[13px] text-white">{link.label ?? "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-400 whitespace-nowrap">{formatDate(link.created_at)}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-400 whitespace-nowrap">{formatDate(link.last_accessed_at)}</td>
                        <td className="px-4 py-3 text-[12px] whitespace-nowrap">
                          {revoked ? (
                            <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-900/40 text-red-300">
                              Revoked
                            </span>
                          ) : (
                            <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-900/30 text-green-300">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[12px] whitespace-nowrap">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleCopy(link)}
                              disabled={revoked}
                              className="rounded-full px-3 py-1 text-[11px] font-semibold text-gray-300 border border-gray-700 disabled:opacity-40"
                              title={revoked ? "Revoked — reinstate to copy" : url}
                            >
                              {copiedId === link.id ? "Copied!" : "Copy URL"}
                            </button>
                            <button
                              onClick={() => handleRevoke(link.id, revoked)}
                              className="rounded-full px-3 py-1 text-[11px] font-semibold"
                              style={
                                revoked
                                  ? { color: "#5CE0D8", border: "1px solid #5CE0D8" }
                                  : { color: "#FCA5A5", border: "1px solid #7F1D1D" }
                              }
                            >
                              {revoked ? "Reinstate" : "Revoke"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
