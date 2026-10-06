"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { peekResume } from "@/features/power-on/engine/storage";

// Both features are browser-only (WebGL, WebAudio, scroll timelines), so skip SSR.
const loadPowerOn = () => import("@/features/power-on/PowerOn");
const Dive = dynamic(() => import("@/features/dive/Dive").then((m) => m.Dive), { ssr: false });
const PowerOn = dynamic(() => loadPowerOn().then((m) => m.PowerOn), { ssr: false });

/**
 * One flow: the Dive's time tunnel lands in 1989 and Power On's 3D desk (its intro) takes over.
 * Scrolling up from the desk goes back into the tunnel; "Replay intro" and "Power off" go back to the top.
 */
export function Experience() {
  // After a locale switch on the desk or mid-story, go straight back there (PowerOn restores the spot).
  const [phase, setPhase] = useState<"dive" | "story">(() => (typeof window !== "undefined" && peekResume() ? "story" : "dive"));
  const [diveAtEnd, setDiveAtEnd] = useState(false);

  // fetch the story while the reader plays with the app, so the handoff has no loading gap
  useEffect(() => { void loadPowerOn(); }, []);

  if (phase === "story")
    return (
      <PowerOn
        onBack={() => { setDiveAtEnd(true); setPhase("dive"); }}
        onReplayIntro={() => { setDiveAtEnd(false); setPhase("dive"); }}
      />
    );
  return <Dive startAtEnd={diveAtEnd} onEnd={() => setPhase("story")} />;
}
