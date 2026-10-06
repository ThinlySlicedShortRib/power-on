"use client";

import dynamic from "next/dynamic";
import { useAutoplay } from "@/features/controls/autoplay";

// Browser-only (WebGL, WebAudio, window scroll), so skip SSR.
const PowerOn = dynamic(() => import("./PowerOn").then((m) => m.PowerOn), { ssr: false });

export function PowerOnStandalone() {
  const autoplay = useAutoplay();
  return <PowerOn autoplay={autoplay} />;
}
