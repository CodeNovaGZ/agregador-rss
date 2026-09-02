import state from './state.js';
import i18n from './i18n.js';
import {validation} from './validation.js';

export default () => {
    document.querySelector('#app').innerHTML = `<div class="container-sm"><h1>${i18n.t('title')}</h1><form id="rss-form">
  <div class="mb-3 floating-label">
    <label for="inputRSS" class="form-label">${i18n.t('form.label')}</label>
    <input type="text" class="form-control" id="inputRSS" aria-describedby="agregarRSS">
    <div class="invalid-feedback" id="invalidRSS"></div>
  </div>
  <button type="submit" class="btn btn-primary mt-2">${i18n.t('form.submit')}</button>
  </form></div>`;

  const form = document.querySelector('#rss-form');
  const input = document.querySelector('#inputRSS');
  
  form.addEventListener('submit', (e)=>{
      e.preventDefault();
      validation(input.value, state.feeds)
      .then((url)=>{
          state.form.value = url;
          state.form.error = null;

          state.feeds.push(url);

          state.form.value = '';
          state.form.error = null;

          input.value = '';
          input.focus();
      })
      .catch((err)=>{
          state.form.error = err.message;
      })
  })
}
