"use client";

import { useCallback, useState } from "react";
import { KEYS, load, save } from "@/features/power-on/engine/storage";

/** Autoplay speeds the controls cycle through. */
export const SPEEDS = [0.75, 1, 1.5, 2] as const;

function readSpeed(): number {
  const v = Number(load(KEYS.speed));
  return (SPEEDS as readonly number[]).includes(v) ? v : 1;
}

/**
 * Autoplay state shared by the whole flow (landing → desk → story), so it keeps playing across the handoff.
 * The speed is remembered; whether it's playing is not (autoplay never starts on its own).
 */
export function useAutoplay() {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeedState] = useState(readSpeed);
  const cycleSpeed = useCallback(() => {
    setSpeedState((s) => {
      const next = SPEEDS[(SPEEDS.indexOf(s as (typeof SPEEDS)[number]) + 1) % SPEEDS.length];
      save(KEYS.speed, String(next));
      return next;
    });
  }, []);
  return { playing, setPlaying, speed, cycleSpeed };
}

export type Autoplay = ReturnType<typeof useAutoplay>;
