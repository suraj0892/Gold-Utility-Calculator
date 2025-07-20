import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import ta from './locales/ta.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      ta: {
        translation: ta,
      },
    },
    // Don't set a default language here, let the language detector handle it
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      // Look for stored language preference
      lookupLocalStorage: 'i18nextLng',
    },
    // Only allow supported languages
    supportedLngs: ['en', 'ta'],
    nonExplicitSupportedLngs: false,
  })
  .then(() => {
    // Only set English as default if no language preference exists at all
    const storedLanguage = localStorage.getItem('i18nextLng');
    if (!storedLanguage) {
      i18n.changeLanguage('en');
    }
  });

export default i18n;
