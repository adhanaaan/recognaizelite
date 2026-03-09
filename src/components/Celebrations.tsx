import Link from "next/link";
import Router from "next/router";
import confettiBG from "public/lottie/confetti-background.json";
import trophy from "public/lottie/trophy.json";
import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { Button } from "src/ui/Button";
import { IconButton } from "./IconButton";
import dynamic from "next/dynamic";

const Lottie = dynamic(
  () => import("lottie-react"),
  { ssr: false } // Disable server-side rendering for this component
);

interface props {}

export const Celebrations: React.FC<props> = () => {
  return (
    <div className="h-full cc md:scale-125 lg:scale-150">
      <IconButton className="absolute p-3 rounded-full top-3 left-2.5" onClick={() => Router.replace("/play")}>
        <FaChevronLeft className="w-6 h-6" />
      </IconButton>
      <Lottie autoPlay loop={false} className="absolute" animationData={confettiBG} />
      <Lottie autoPlay loop={false} style={{ height: 300, width: 300 }} animationData={trophy} />
      <h4 className="mb-6 animate-opacity">You've completed this game</h4>
      <Link href="/play">
        <Button btn="none" className="relative z-10 shadow w-72 bg-gradient-to-b from-emerald-500 to-emerald-600">
          Go Home
        </Button>
      </Link>
    </div>
  );
};
