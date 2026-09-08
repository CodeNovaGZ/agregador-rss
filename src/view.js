import { subscribe } from 'valtio/vanilla';
import { Modal } from 'bootstrap';
import state from './state.js';
import i18n from './i18n.js';

const renderFeeds = () => {
  const feeds = document.querySelector('#feeds');

  feeds.innerHTML = '';

  state.feeds.forEach((feed) => {
    const article = document.createElement('article');
    article.classList.add('mb-3');

    const title = document.createElement('h3');
    title.classList.add('h5', 'fw-semibold', 'mb-1');
    title.textContent = feed.title;

    const description = document.createElement('p');
    description.classList.add('text-secondary', 'mb-0');
    description.textContent = feed.description;

    article.append(title, description);
    feeds.append(article);
  });
};

const openPreview = (postId) => {
  const post = state.posts.find((savedPost) => savedPost.id === postId);

  if (!post) {
    return;
  }

  post.read = true;

  document.querySelector('#postModalLabel').textContent = post.title;
  document.querySelector('#postModalDescription').textContent = post.description ?? '';

  const link = document.querySelector('#postModalLink');
  link.href = post.link;

  Modal.getOrCreateInstance('#postModal').show();
};

const renderPosts = () => {
  const posts = document.querySelector('#posts');

  posts.innerHTML = '';

  state.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'gap-2', 'mb-2');

    const link = document.createElement('a');
    link.href = post.link;
    link.textContent = post.title;
    link.classList.add('text-primary', post.read ? 'fw-normal' : 'fw-bold');

    const preview = document.createElement('button');
    preview.type = 'button';
    preview.dataset.postId = post.id;
    preview.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'flex-shrink-0');
    preview.textContent = i18n.t('button.preview');

    li.append(link, preview);
    posts.append(li);
  });
};

const renderForm = () => {
  const input = document.querySelector('#inputRSS');
  const feedback = document.querySelector('#rssFeedback');

  feedback.classList.remove('text-danger', 'text-success');

  if (state.form.error) {
    feedback.textContent = i18n.t(state.form.error);
    feedback.classList.add('text-danger');
    input.classList.add('is-invalid');
  } else if (state.form.success) {
    feedback.textContent = i18n.t('success');
    feedback.classList.add('text-success');
    input.classList.remove('is-invalid');
  } else {
    feedback.textContent = '';
    input.classList.remove('is-invalid');
  }
};

const render = () => {
  renderForm();
  renderFeeds();
  renderPosts();
};

let initialized = false;

export default () => {
  if (initialized) {
    return;
  }
  initialized = true;

  document.querySelector('#posts').addEventListener('click', (e) => {
    const button = e.target.closest('[data-post-id]');

    if (button) {
      openPreview(button.dataset.postId);
    }
  });

  render();
  subscribe(state, render);
};