import * as i18next from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "src/i18n/locales/en.json";
import deTranslations from "src/i18n/locales/de.json";

export const LANGUAGES = {
  EN: "en",
  DE: "de",
} as const;

const resources = {
  [LANGUAGES.DE]: {
    translation: deTranslations,
  },
  [LANGUAGES.EN]: {
    translation: enTranslations,
  },
};

i18next.use(initReactI18next).init({
  fallbackLng: LANGUAGES.EN,
  interpolation: {
    escapeValue: false,
  },
  lng: LANGUAGES.EN,
  resources,
});

export default i18next;
