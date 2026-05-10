import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { useCumulativeCounter } from "src/hooks/useCumulativeCounter";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setHookClinic, setHookReportPath } from "src/utils/assessment";

// Self-serve booth variant of /tcmbrain. Same flow + scoring; the report
// page (/tcmbrainQR-report) shows the AI Wellness PayNow QR as the primary
// CTA instead of "Speak to a practitioner". Print whichever signage QR
// matches the booth setup (manned vs. unmanned).
export default function TcmBrainQREntry() {
  const liveCount = useCumulativeCounter({
    anchorDate: "2026-04-01",
    baseCount: 80,
    dailyMin: 10,
    dailyMax: 25,
  });

  useEffect(() => {
    setHookClinic("SJMC");
    setHookReportPath("/tcmbrainQR-report");
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
  }, []);

  return (
    <>
      <Head>
        <meta name="theme-color" content="#F2F7F1" />
        <title>Holistic Brain Health Screening | ReCOGnAIze</title>
        <meta property="og:title" content="Where the body finds balance, the mind finds clarity." />
        <meta property="og:description" content="A 60-second cognitive screening that complements your TCM consultation. Free, no app needed." />
        <meta property="og:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Holistic Brain Health Screening" />
        <meta name="twitter:description" content="A 60-second cognitive screening that complements your TCM consultation." />
        <meta name="twitter:image" content="https://recognaizelite.vercel.app/api/og-sjmc" />
      </Head>
      <div
        className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 overflow-hidden relative"
        style={{ background: "linear-gradient(180deg, #FBF8F3 0%, #F2EBDF 50%, #FBF8F3 100%)" }}
      >
        {/* Co-brand: small label + AI Wellness logo */}
        <div className="text-center mb-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
            In partnership with
          </p>
          <img
            src="/aiwellness-logo.jpeg"
            alt="Asia Integrated Wellness"
            className="mx-auto w-[240px] rounded-lg"
          />
        </div>

        {/* Headline */}
        <div className="text-center max-w-[340px] mx-auto mb-5">
          <h1
            className="text-[#1F2937] text-[36px] sm:text-[44px] leading-[1.08] font-normal"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            When the body is in{" "}
            <em className="text-[#7AB5A7]">harmony,</em>
            <br />
            the mind follows.
          </h1>
          <p className="mt-4 text-[#4B5563] text-[15px] leading-relaxed">
            Clear thinking flows from balanced qi and blood — TCM has held this for centuries.
            <br />
            <span className="font-semibold text-[#1F2937]">Take 60 seconds to measure where your cognition stands today.</span>
          </p>
        </div>

        {/* Live counter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7AB5A7] opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#7AB5A7]" />
          </span>
          <p className="text-[13px] text-[#4B5563]">
            <span className="font-bold text-[#1F2937]">{liveCount}</span> screened so far
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => Router.push("/instruction")}
          className="w-full max-w-[300px] rounded-full px-8 py-4 text-[17px] font-bold text-white tracking-wide transition-all active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #E89671 0%, #D5704D 100%)",
            boxShadow: "0 4px 24px rgba(213,112,77,0.35)",
          }}
        >
          Begin Screening — 60 Seconds
        </button>

        {/* Trust signals */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: "⚡", label: "60 seconds" },
            { icon: "📱", label: "No app needed" },
            { icon: "📊", label: "Instant results" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <span className="text-[12px]">{item.icon}</span>
              <span className="text-[11px] font-medium text-[#4B5563]">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom branding */}
        <div className="absolute bottom-5 left-0 right-0 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src="/logo.png" alt="ReCOGnAIze" className="w-[22px] h-[22px]" />
            <span className="text-[11px] font-medium text-[#9CA3AF]">ReCOGnAIze</span>
          </div>
          <p className="text-[9px] text-[#B0A296]">
            In partnership with AI Wellness — Embracing Longevity
          </p>
        </div>
      </div>
    </>
  );
}
