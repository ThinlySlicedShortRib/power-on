import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh-Hant", "zh-Hans", "es"],
  defaultLocale: "en",
});

export type AppLocale = (typeof routing.locales)[number];
