import * as i18next from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "src/i18n/locales/en.json";
import deTranslations from "src/i18n/locales/de.json";

const resources = {
  de: {
    translation: deTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

i18next.use(initReactI18next).init({
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  lng: "en",
  resources,
});

export default i18next;
