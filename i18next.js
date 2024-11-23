import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import ua from "./locales/ua.json";

export const LanguageResources = {
  en: { translation: en },
  ru: { translation: ru },
  ua: { translation: ua },
};

i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "en",
  fallbackLng: "en",
  resources: LanguageResources,
});

export default i18next;
