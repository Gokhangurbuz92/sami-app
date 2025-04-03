import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des traductions
import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import ps from './locales/ps.json';
import tr from './locales/tr.json';
import so from './locales/so.json';
import ml from './locales/ml.json';
import gn from './locales/gn.json';
import ci from './locales/ci.json';
import bn from './locales/bn.json';
import ur from './locales/ur.json';
import sw from './locales/sw.json';
import ti from './locales/ti.json';
import wo from './locales/wo.json';
import yo from './locales/yo.json';
import zu from './locales/zu.json';

// Configuration des langues RTL
const rtlLanguages = ['ar', 'ps', 'ur'];

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
  ps: { translation: ps },
  tr: { translation: tr },
  so: { translation: so },
  ml: { translation: ml },
  gn: { translation: gn },
  ci: { translation: ci },
  bn: { translation: bn },
  ur: { translation: ur },
  sw: { translation: sw },
  ti: { translation: ti },
  wo: { translation: wo },
  yo: { translation: yo },
  zu: { translation: zu }
};

i18n
  .use(LanguageDetector)
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
    }
  });

// Fonction pour vérifier si une langue est RTL
export const isRTL = (lang: string) => rtlLanguages.includes(lang);

// Fonction pour obtenir la direction du texte
export const getTextDirection = (lang: string) => isRTL(lang) ? 'rtl' : 'ltr';

export default i18n; 