import Head from "next/head";
import Router from "next/router";
import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Invalid password");
      }
      Router.replace("/admin/leads");
    } catch (err) {
      setError((err as Error).message || "Login failed");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F4F6FA] px-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-[#E5E7EB]"
        >
          <h1 className="text-[22px] font-bold text-[#1F2937]">Admin access</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Enter the admin password to view collected leads.
          </p>
          <label className="mt-6 block text-[12px] font-semibold text-[#4B5563]">
            Password
          </label>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className="mt-1.5 w-full rounded-lg border border-[#D1D5DB] px-3 py-2.5 text-[14px] text-[#1F2937] outline-none focus:border-[#2563EB]"
          />
          {error && (
            <p className="mt-3 text-[12px] text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting || !password}
            className="mt-5 w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </>
  );
}
