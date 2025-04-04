import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 📁 Import des fichiers de traduction
import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import ps from './locales/ps.json';
import tr from './locales/tr.json';
import so from './locales/so.json';
import bn from './locales/bn.json';

// 📌 Langues supportées et leur direction
const rtlLanguages = ['ar', 'ps', 'ur', 'fa', 'he'];

export const getTextDirection = (lang: string) => rtlLanguages.includes(lang) ? 'rtl' : 'ltr';

export const isRTL = (lang: string) => getTextDirection(lang) === 'rtl';

// 🗂️ Langues disponibles
const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
  ps: { translation: ps },
  tr: { translation: tr },
  so: { translation: so },
  bn: { translation: bn }
};

i18n
  .use(LanguageDetector) // détecte automatiquement (navigateur, localStorage)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    react: {
      useSuspense: false
    }
  });

// 🧭 Appliquer la direction dès que la langue est changée
i18n.on('languageChanged', (lang) => {
  const dir = getTextDirection(lang);
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
});

// Appliquer au premier chargement
const initialLang = i18n.language || 'en';
document.documentElement.dir = getTextDirection(initialLang);
document.documentElement.lang = initialLang;

export default i18n;
