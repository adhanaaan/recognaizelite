import Head from "next/head";
import { useEffect, useState } from "react";

interface Lead {
  email: string;
  clinic: string;
  timestamp: string;
  savedAt: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leads")
      .then(res => res.json())
      .then(data => setLeads(data.leads ?? []))
      .catch(() => setError("Failed to load leads"))
      .finally(() => setLoading(false));
  }, []);

  const downloadCSV = () => {
    const header = "Email,Clinic,Submitted At,Saved At";
    const rows = leads.map(l =>
      `"${l.email}","${l.clinic}","${l.timestamp}","${l.savedAt}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Head>
        <title>Leads - Admin</title>
        <meta name="theme-color" content="#0B0F1A" />
      </Head>
      <div
        className="min-h-screen w-full px-5 py-10 sm:px-8"
        style={{ background: "linear-gradient(180deg, #0B0F1A 0%, #101828 50%, #0B0F1A 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white text-[24px] font-bold">Collected Leads</h1>
              <p className="text-gray-500 text-[13px] mt-1">
                {leads.length} email{leads.length !== 1 ? "s" : ""} collected
              </p>
            </div>
            {leads.length > 0 && (
              <button
                onClick={downloadCSV}
                className="rounded-full px-5 py-2.5 text-[13px] font-bold transition-all active:opacity-90"
                style={{ backgroundColor: "#5CE0D8", color: "#0B0F1A" }}
              >
                Download CSV
              </button>
            )}
          </div>

          {loading && (
            <p className="text-gray-400 text-center py-20">Loading...</p>
          )}

          {error && (
            <div className="rounded-2xl border border-red-800 bg-red-900/30 p-6 text-center text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && leads.length === 0 && (
            <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 text-center text-gray-400">
              No leads collected yet.
            </div>
          )}

          {!loading && !error && leads.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1F2937" }}>
              <table className="w-full text-left">
                <thead>
                  <tr style={{ backgroundColor: "#111827" }}>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">#</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Email</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Source</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr
                      key={lead.email + lead.savedAt}
                      style={{ backgroundColor: i % 2 === 0 ? "#0D1320" : "#111827", borderTop: "1px solid #1F2937" }}
                    >
                      <td className="px-4 py-3 text-[13px] text-gray-600">{i + 1}</td>
                      <td className="px-4 py-3 text-[14px] text-white font-medium">{lead.email}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-400 hidden sm:table-cell">{lead.clinic}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-400">
                        {new Date(lead.timestamp).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
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
