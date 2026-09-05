import axios from 'axios';

export default (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`;

  return axios.get(proxyUrl, {
    params: {
      disableCache: true,
    },
  });
};