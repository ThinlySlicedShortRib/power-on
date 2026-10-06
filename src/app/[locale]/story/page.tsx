import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PowerOnStandalone } from "@/features/power-on/PowerOnStandalone";

// Deep link straight to the Power On story (with its own intro), skipping the landing dive.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function StoryPage({ params }: PageProps<"/[locale]/story">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PowerOnStandalone />;
}
