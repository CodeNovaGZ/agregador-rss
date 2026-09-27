import axios from 'axios';
import { AppError, ErrorCode } from './errors.js';

export default async (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`;

  try {
    const response = await axios.get(proxyUrl, {
      params: {
        disableCache: true,
      },
    });

    const contents = response.data?.contents;

    if (typeof contents !== 'string' || contents === '') {
      throw new AppError(ErrorCode.NETWORK);
    }

    return contents;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(ErrorCode.NETWORK);
  }
};
