import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Each feature owns one namespace file per locale: messages/<locale>/<namespace>.json
export const namespaces = ["common", "dive", "story", "glossary"] as const;

async function loadMessages(locale: string) {
  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const mod = await import(`../../messages/${locale}/${ns}.json`).catch(
        () => import(`../../messages/${routing.defaultLocale}/${ns}.json`),
      );
      return [ns, mod.default] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  return { locale, messages: await loadMessages(locale) };
});
