export default (xml) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, 'application/xml');

  const channel = document.querySelector('channel');

  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;

  const posts = [...channel.querySelectorAll('item')].map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
  }));

  return {
    feed: {
      title,
      description,
    },
    posts,
  };
};