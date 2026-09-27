import i18n from './i18n.js';
import { createStore, FormStatus } from './state.js';
import { validateUrl } from './validation.js';
import { AppError, ErrorCode } from './errors.js';
import getFeed from './api.js';
import parse from './parser.js';

let pollingStarted = false;

const generateId = () => (
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
);

const upsertPosts = (store, feedId, posts) => {
  posts.forEach((post) => {
    if (!post.title && !post.link) {
      return;
    }

    const key = post.link || post.title;
    const exists = store.posts.some(
      (savedPost) => (savedPost.link || savedPost.title) === key,
    );

    if (!exists) {
      store.posts.push({
        id: generateId(),
        feedId,
        title: post.title,
        description: post.description,
        link: post.link,
        read: false,
      });
    }
  });
};

const checkFeeds = (store) => {
  const promises = store.feeds.map((feed) => {
    return getFeed(feed.url)
      .then((xml) => parse(xml))
      .then((data) => {
        upsertPosts(store, feed.id, data.posts);
      })
      .catch(() => {
        // Si un feed falla, continuamos con los demás
      });
  });

  Promise.all(promises).then(() => {
    setTimeout(() => checkFeeds(store), 5000);
  });
};

const renderLayout = () => {
  const exampleUrl = i18n.t('form.exampleUrl');

  document.querySelector('#app').innerHTML = `
  <header class="bg-dark text-white py-5 mb-4">
    <div class="container">
      <h1 class="display-4 mb-3">${i18n.t('title')}</h1>
      <p class="text-white-50 fs-5">${i18n.t('subtitle')}</p>
      <form id="rss-form" class="mt-4" novalidate>
        <div class="input-group">
          <label class="visually-hidden" for="url">${i18n.t('form.label')}</label>
          <input id="url" name="url" type="text" class="form-control" placeholder="${i18n.t('form.placeholder')}" aria-label="${i18n.t('form.label')}" autocomplete="off">
          <button type="submit" id="rss-submit" class="btn btn-primary">${i18n.t('form.submit')}</button>
        </div>
        <p class="mt-3 mb-0 text-secondary">
          ${i18n.t('form.exampleLabel')}
          <a href="${exampleUrl}" class="text-secondary">${exampleUrl}</a>
        </p>
        <div id="rssFeedback" class="feedback fs-5 fw-semibold" role="status" aria-live="polite"></div>
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
};

export default () => {
  if (document.querySelector('#rss-form')) {
    return null;
  }

  const store = createStore();

  renderLayout();

  const form = document.querySelector('#rss-form');
  const input = document.querySelector('#url');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (store.form.status === FormStatus.LOADING) {
      return;
    }

    store.form.error = null;
    store.form.status = FormStatus.LOADING;

    const url = input.value.trim();

    try {
      const errorCode = await validateUrl(url, store.feeds);

      if (errorCode) {
        throw new AppError(errorCode);
      }

      const xml = await getFeed(url);
      const data = parse(xml);

      const feed = {
        id: generateId(),
        url,
        title: data.feed.title,
        description: data.feed.description,
      };

      store.feeds.push(feed);

      upsertPosts(store, feed.id, data.posts);

      if (!pollingStarted) {
        pollingStarted = true;
        checkFeeds(store);
      }
    } catch (err) {
      store.form.error = err instanceof AppError ? err.code : ErrorCode.UNKNOWN;
    } finally {
      store.form.status = store.form.error ? FormStatus.ERROR : FormStatus.SUCCESS;
    }
  });

  return store;
};
