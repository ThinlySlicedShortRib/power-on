"use client";

import dynamic from "next/dynamic";

// Browser-only (WebGL, WebAudio, window scroll), so skip SSR.
const PowerOn = dynamic(() => import("./PowerOn").then((m) => m.PowerOn), { ssr: false });

export function PowerOnStandalone() {
  return <PowerOn />;
}
