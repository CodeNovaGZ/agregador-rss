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

  return getText(item, 'guid');
};

export default (xml) => {
  const parser = new DOMParser();

  const document = parser.parseFromString(xml, 'application/xml');

  if (document.querySelector('parsererror')) {
    throw new Error('errors.parse');
  }

  const atomFeed = document.querySelector('feed');

  if (atomFeed) {
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
  }

  const channel = document.querySelector('channel');

  const title = channel.querySelector('title').textContent;

  const description = channel.querySelector('description').textContent;

  const posts = [...channel.querySelectorAll('item')].map((item) => ({
    title: item.querySelector('title')?.textContent,
    description: item.querySelector('description')?.textContent,
    link: getHref(item),
  }));

  return {
    feed: {
      title,
      description,
    },
    posts,
  };
};