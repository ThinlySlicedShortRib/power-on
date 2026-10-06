"use client";

import { createContext, useContext } from "react";
import type { LikeCarry } from "@/features/experience/like";
import type { Dioramas } from "../engine/dioramas";
import type { Music } from "../engine/music";
import type { AudioEngine } from "../engine/sfx";

export interface PowerOnCtx {
  audio: AudioEngine;
  music: Music;
  dioramas: Dioramas;
  reduce: boolean;
  touch: boolean;
  /** the reader's like, carried from murmur on the landing */
  like: LikeCarry;
}

export const PowerOnContext = createContext<PowerOnCtx | null>(null);

export function usePowerOn(): PowerOnCtx {
  const c = useContext(PowerOnContext);
  if (!c) throw new Error("usePowerOn outside <PowerOn>");
  return c;
}
