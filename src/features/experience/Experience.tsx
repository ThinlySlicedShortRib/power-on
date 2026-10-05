"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Both features are browser-only (WebGL, WebAudio, scroll timelines), so skip SSR.
const Dive = dynamic(() => import("@/features/dive/Dive").then((m) => m.Dive), { ssr: false });
const PowerOn = dynamic(() => import("@/features/power-on/PowerOn").then((m) => m.PowerOn), { ssr: false });

/**
 * The single flow: the Dive landing ends on the dark 1989 desk. Pressing "Power on" there
 * hands over to the Power On story, which starts already booting (the click is the user
 * gesture that unlocks audio).
 */
export function Experience() {
  const [phase, setPhase] = useState<"dive" | "story">("dive");

  if (phase === "story") return <PowerOn bootImmediately onReplayIntro={() => setPhase("dive")} />;
  return <Dive onPowerOn={() => setPhase("story")} />;
}
