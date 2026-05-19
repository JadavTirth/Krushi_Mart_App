import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import hi from './hi.json';
import gu from './gu.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  gu: { translation: gu },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
