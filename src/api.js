import axios from 'axios';
import { AppError, ErrorCode } from './errors.js';

const PROXY_URL = 'https://allorigins.hexlet.app/get';

export default async (url) => {
  try {
    const response = await axios.get(PROXY_URL, {
      params: {
        url,
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
