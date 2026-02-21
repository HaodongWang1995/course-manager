import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import zh from "../locales/zh.json";

// Build i18next resources: keep full JSON under "translation" AND register
// each top-level key as its own namespace so useTranslation("publicCourses")
// with t("title") resolves correctly alongside useTranslation() + t("nav.support").
function buildResources(locale: Record<string, unknown>) {
  const ns: Record<string, unknown> = { translation: locale };
  for (const [key, value] of Object.entries(locale)) {
    if (typeof value === "object" && value !== null) {
      ns[key] = value;
    }
  }
  return ns;
}

const enResources = buildResources(en as Record<string, unknown>);
const zhResources = buildResources(zh as Record<string, unknown>);

const savedLang = localStorage.getItem("lang") ?? "zh";

i18n.use(initReactI18next).init({
  resources: {
    en: enResources as Record<string, Record<string, string>>,
    zh: zhResources as Record<string, Record<string, string>>,
  },
  lng: savedLang,
  fallbackLng: "en",
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
});

export function setLanguage(lang: string) {
  i18n.changeLanguage(lang);
  localStorage.setItem("lang", lang);
}

export default i18n;
