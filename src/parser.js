import { AppError, ErrorCode } from './errors.js';

const getText = (element, selector) => (
  element.querySelector(selector)?.textContent ?? null
);

const getHref = (item) => {
  const linkEl = item.querySelector('link');

  if (linkEl?.getAttribute('href')) {
    return linkEl.getAttribute('href');
  }

  if (linkEl?.textContent) {
    return linkEl.textContent;
  }

  return getText(item, 'guid') ?? item.getAttribute('rdf:about') ?? null;
};

const parseAtom = (document) => {
  const atomFeed = document.querySelector('feed');

  if (!atomFeed) {
    return null;
  }

  const posts = [...atomFeed.querySelectorAll('entry')].map((entry) => ({
    title: getText(entry, 'title'),
    description: getText(entry, 'content') ?? getText(entry, 'summary'),
    link: getHref(entry),
  }));

  return {
    feed: {
      title: getText(atomFeed, 'title'),
      description: getText(atomFeed, 'subtitle') ?? getText(atomFeed, 'description'),
    },
    posts,
  };
};

const parseChannel = (document) => {
  const channel = document.querySelector('channel');

  if (!channel) {
    return null;
  }

  // RSS 2.0 anida los item dentro del channel, RSS 1.0/RDF los deja como hermanos
  const posts = [...document.querySelectorAll('item')].map((item) => ({
    title: getText(item, 'title'),
    description: getText(item, 'description'),
    link: getHref(item),
  }));

  return {
    feed: {
      title: getText(channel, 'title'),
      description: getText(channel, 'description'),
    },
    posts,
  };
};

export default (xml) => {
  const parser = new DOMParser();

  const document = parser.parseFromString(xml, 'application/xml');

  if (document.querySelector('parsererror')) {
    throw new AppError(ErrorCode.UNPARSABLE);
  }

  const parsed = parseAtom(document) ?? parseChannel(document);

  if (!parsed) {
    throw new AppError(ErrorCode.UNPARSABLE);
  }

  return parsed;
};
