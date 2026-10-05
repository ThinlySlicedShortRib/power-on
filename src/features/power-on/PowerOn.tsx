"use client";

export function PowerOn({ bootImmediately, onReplayIntro }: { bootImmediately?: boolean; onReplayIntro?: () => void }) {
  return <main>Power On placeholder {bootImmediately ? "(booting)" : ""} <button onClick={onReplayIntro}>Replay intro</button></main>;
}
