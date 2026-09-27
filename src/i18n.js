import { createInstance } from 'i18next';
import es from './locales/es.js';
import en from './locales/en.js';

const i18n = createInstance();

export const initI18n = () => i18n.init({
  lng: 'es',
  fallbackLng: 'es',
  resources: { es, en },
  returnEmptyString: false,
});

export default i18n;
