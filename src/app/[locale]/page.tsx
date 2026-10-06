import { setRequestLocale } from "next-intl/server";
import { PowerOnStandalone } from "@/features/power-on/PowerOnStandalone";

// The site opens straight on the 1989 desk. (The old landing, src/features/dive, is unhooked while a new intro is decided.)
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PowerOnStandalone />;
}
