import { subscribe } from 'valtio/vanilla';
import { Modal } from 'bootstrap';
import DOMPurify from 'dompurify';
import { FormStatus } from './state.js';
import { ErrorCode } from './errors.js';
import i18n from './i18n.js';

const ERROR_MESSAGES = {
  [ErrorCode.REQUIRED]: 'errors.required',
  [ErrorCode.INVALID_URL]: 'errors.url',
  [ErrorCode.DUPLICATE]: 'errors.duplicate',
  [ErrorCode.UNPARSABLE]: 'errors.parse',
  [ErrorCode.NETWORK]: 'errors.network',
  [ErrorCode.UNKNOWN]: 'errors.unknown',
};

const openPreview = (store, postId) => {
  const post = store.posts.find((savedPost) => savedPost.id === postId);

  if (!post) {
    return;
  }

  post.read = true;

  document.querySelector('#postModalLabel').textContent = post.title ?? post.link ?? '';
  document.querySelector('#modal-body').innerHTML = DOMPurify.sanitize(post.description ?? '');

  const link = document.querySelector('#postModalLink');
  link.classList.toggle('d-none', !post.link);

  if (post.link) {
    link.href = post.link;
  }

  Modal.getOrCreateInstance('#modal').show();
};

const renderFeeds = (store) => {
  const container = document.querySelector('#feeds');
  container.replaceChildren();

  store.feeds.forEach((feed) => {
    const article = document.createElement('article');
    article.classList.add('mb-3');

    const title = document.createElement('h3');
    title.classList.add('h5', 'fw-semibold', 'mb-1');
    title.textContent = feed.title ?? feed.url;

    article.append(title);

    if (feed.description) {
      const description = document.createElement('p');
      description.classList.add('text-secondary', 'mb-0');
      description.textContent = feed.description;
      article.append(description);
    }

    container.append(article);
  });
};

const renderPosts = (store) => {
  const container = document.querySelector('#posts');
  container.replaceChildren();

  store.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'gap-2', 'mb-2');

    const headline = document.createElement(post.link ? 'a' : 'span');
    headline.textContent = post.title ?? post.link;

    if (post.link) {
      headline.href = post.link;
    }

    if (post.read) {
      headline.classList.add('link-secondary');
    } else {
      headline.classList.add('text-primary', 'fw-bold');
    }

    const preview = document.createElement('button');
    preview.type = 'button';
    preview.dataset.postId = post.id;
    preview.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'flex-shrink-0');
    preview.textContent = i18n.t('button.preview');

    li.append(headline, preview);
    container.append(li);
  });
};

const renderSubmit = (isLoading) => {
  const button = document.querySelector('#rss-submit');
  button.disabled = isLoading;
  button.replaceChildren();

  if (isLoading) {
    const spinner = document.createElement('span');
    spinner.classList.add('spinner-border', 'spinner-border-sm', 'me-2');
    spinner.setAttribute('aria-hidden', 'true');
    button.append(spinner, document.createTextNode(i18n.t('form.submitting')));
  } else {
    button.textContent = i18n.t('form.submit');
  }
};

const renderForm = (store) => {
  const form = document.querySelector('#rss-form');
  const input = document.querySelector('#url');
  const feedback = document.querySelector('#rssFeedback');
  const isLoading = store.form.status === FormStatus.LOADING;

  form.setAttribute('aria-busy', String(isLoading));
  input.disabled = isLoading;
  renderSubmit(isLoading);

  feedback.classList.remove('text-danger', 'text-success');
  input.classList.remove('is-invalid');

  if (store.form.error) {
    const messageKey = ERROR_MESSAGES[store.form.error] ?? ERROR_MESSAGES[ErrorCode.UNKNOWN];
    feedback.textContent = i18n.t(messageKey);
    feedback.classList.add('text-danger');
    input.classList.add('is-invalid');
  } else if (store.form.status === FormStatus.SUCCESS) {
    feedback.textContent = i18n.t('success');
    feedback.classList.add('text-success');
  } else {
    feedback.textContent = '';
  }
};

const render = (store) => {
  renderForm(store);
  renderFeeds(store);
  renderPosts(store);
};

export default (store) => {
  const posts = document.querySelector('#posts');

  if (!posts) {
    return;
  }

  posts.addEventListener('click', (e) => {
    const button = e.target.closest('[data-post-id]');

    if (button) {
      openPreview(store, button.dataset.postId);
    }
  });

  render(store);
  subscribe(store, () => render(store));
};
