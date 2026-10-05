import { setRequestLocale } from "next-intl/server";
import { Experience } from "@/features/experience/Experience";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Experience />;
}
