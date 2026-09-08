import i18next from 'i18next';
import es from './locales/es.js';
import en from './locales/en.js';

i18next.init({
  lng: 'es',
  resources: {
    es,
    en,
  },
});

export default i18next;