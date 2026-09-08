import state from './state.js';
import i18n from './i18n.js';
import {validation} from './validation.js';
import getFeed from './api.js';
import parse from './parser.js';


let pollingStarted = false;

const generateId = () => (
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
);

const checkFeeds = () => {
  const promises = state.feeds.map((feed) => {
    return getFeed(feed.url)
      .then((response) => parse(response.data.contents))
      .then((data) => {
        data.posts.forEach((post) => {
          const exists = state.posts.some(
            (savedPost) => savedPost.link === post.link,
          );

          if (!exists) {
            state.posts.push({
              id: generateId(),
              feedId: feed.id,
              title: post.title,
              description: post.description,
              link: post.link,
              read: false,
            });
          }
        });
      })
      .catch(() => {
        // Si un feed falla, continuamos con los demás
      });
  });

  Promise.all(promises).then(() => {
    setTimeout(checkFeeds, 5000);
  });
};


export default () => {
    if (document.querySelector('#rss-form')) {
      return;
    }

    document.querySelector('#app').innerHTML = `
  <header class="bg-dark text-white py-5 mb-4">
    <div class="container">
      <h1 class="display-4 mb-3">${i18n.t('title')}</h1>
      <p class="text-white-50 fs-5">${i18n.t('subtitle')}</p>
      <form id="rss-form" class="mt-4">
        <div class="input-group">
          <label class="visually-hidden" for="url">${i18n.t('form.placeholder')}</label>
          <input id="url" name="url" type="text" class="form-control" placeholder="${i18n.t('form.placeholder')}" aria-label="url">
          <button type="submit" class="btn btn-primary">${i18n.t('form.submit')}</button>
        </div>
        <p class="mt-3 mb-0 text-secondary">
          ${i18n.t('form.exampleLabel')}
          <a href="https://hexlet.io/lessons.rss" class="text-secondary">https://hexlet.io/lessons.rss</a>
        </p>
        <div id="rssFeedback" class="feedback fs-5 fw-semibold"></div>
      </form>
    </div>
  </header>
  <main class="container pb-5">
    <div class="row g-4">
      <section class="col-lg-8">
        <h2>${i18n.t('posts')}</h2>
        <ul id="posts" class="posts list-unstyled"></ul>
      </section>
      <section class="col-lg-4">
        <h2>${i18n.t('feeds')}</h2>
        <div id="feeds" class="feeds"></div>
      </section>
    </div>
  </main>
  <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="postModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title fs-5" id="postModalLabel"></h2>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${i18n.t('modal.close')}"></button>
        </div>
        <div class="modal-body" id="modal-body"></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${i18n.t('modal.close')}</button>
          <a href="#" id="postModalLink" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${i18n.t('modal.readFull')}</a>
        </div>
      </div>
    </div>
  </div>`;

  const form = document.querySelector('#rss-form');
  const input = document.querySelector('#url');
  
  form.addEventListener('submit', (e)=>{
      e.preventDefault();
      state.form.error = null;
      state.form.success = false;
      const url = input.value;
      validation(url, state.feeds)
        .then(() => getFeed(url))
        .then((response) => parse(response.data.contents))
        .then((data) => {
            const feedId = generateId();

            state.feeds.push({
              id: feedId,
              url,
              title: data.feed.title,
              description: data.feed.description,
            });

            data.posts.forEach((post) => {
              state.posts.push({
id: generateId(),
                feedId,
                title: post.title,
                description: post.description,
                link: post.link,
                read: false,
              });
            });

            state.form.success = true;

            if (!pollingStarted) {
              pollingStarted = true;
              checkFeeds();
            }
          }).catch((err) => {
              const errorKeys = ['errors.required', 'errors.url', 'errors.duplicate', 'errors.parse'];
              state.form.error = errorKeys.includes(err.message) ? err.message : 'errors.network';
        });
  })
}
