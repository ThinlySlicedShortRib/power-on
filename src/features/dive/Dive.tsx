"use client";

export function Dive({ onPowerOn }: { onPowerOn: () => void }) {
  return <button onClick={onPowerOn}>Power on (dive placeholder)</button>;
}
