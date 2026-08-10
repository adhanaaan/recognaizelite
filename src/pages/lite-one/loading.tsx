import Head from "next/head";
import Router from "next/router";
import React from "react";
import { LiteShell } from "src/components/LiteOne/LiteShell";
import { useResultStore } from "src/stores/useResultStore";
import {
  fetchLiteReport,
  readLiteProfile,
  readStashedReport,
  stashReport,
} from "src/utils/liteOne";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function LiteOneLoading() {
  const { result } = useResultStore();
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    const profile = readLiteProfile();
    if (profile?.name) setName(profile.name);
  }, []);

  React.useEffect(() => {
    const stashed = readStashedReport();
    if (stashed) {
      delay(1500).then(() => Router.replace("/lite-one/report"));
      return;
    }

    if (!result || Object.keys(result).length === 0) {
      delay(1500).then(() => Router.replace("/lite-one/report"));
      return;
    }

    let cancelled = false;
    Promise.all([fetchLiteReport(result), delay(1500)])
      .then(([report]) => {
        if (cancelled) return;
        stashReport(report);
        Router.replace("/lite-one/report");
      })
      .catch(() => {
        if (!cancelled) Router.replace("/lite-one/report");
      });

    return () => { cancelled = true; };
  }, [result]);

  const greeting = name
    ? `${name}, we are building your profile`
    : "We are building your profile";

  return (
    <>
      <Head>
        <title>Building your profile | ReCOGnAIze Lite</title>
      </Head>

      <LiteShell>
        <div className="relative flex flex-1 flex-col items-center justify-center px-6">
          <p
            className="lite-rise lite-breathe max-w-[320px] text-center font-display text-[24px] font-extrabold leading-[1.2] text-charcoal sm:text-[28px]"
            style={{ animationDelay: "80ms" }}
          >
            {greeting}
          </p>
        </div>
      </LiteShell>
    </>
  );
}
