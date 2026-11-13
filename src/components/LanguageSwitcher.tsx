"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

// Unstyled on purpose: each era HUD styles it through the className it passes in.
// Pass a distinct id when more than one is on the page at once.
export function LanguageSwitcher({ className, id = "language-switcher" }: { className?: string; id?: string }) {
  const t = useTranslations("common.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className={className}>
      <span className="visually-hidden">{t("label")}</span>
      <select
        id={id}
        value={locale}
        onChange={(e) => router.replace(pathname, { locale: e.target.value as AppLocale, scroll: false })}
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {t(l)}
          </option>
        ))}
      </select>
    </label>
  );
}
