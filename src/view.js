import {subscribe} from 'valtio/vanilla';
import state from './state.js';
import i18n from './i18n.js';

const render = () => {
    const input = document.querySelector('#inputRSS');
    const feedback = document.querySelector('#invalidRSS');

    if (state.form.error) {
        feedback.textContent = i18n.t(state.form.error);
        input.classList.add('is-invalid');
    } else {
        feedback.textContent = '';
        input.classList.remove('is-invalid');
    }
}

export default () => {
    render();
    subscribe(state, render);
}