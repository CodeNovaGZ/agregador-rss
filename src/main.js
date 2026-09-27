import './style.css';
import i18n, { initI18n } from './i18n.js';
import app from './app.js';
import initView from './view.js';

initI18n()
  .then(() => {
    document.title = i18n.t('title');
    document.documentElement.lang = i18n.language;

    const store = app();

    if (store) {
      initView(store);
    }
  })
  .catch((error) => {
    console.error(error);
  });
