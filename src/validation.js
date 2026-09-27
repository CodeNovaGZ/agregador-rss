import * as yup from 'yup';
import { ErrorCode } from './errors.js';

const urlSchema = yup.string().url();

export const validateUrl = async (url, feeds) => {
  const value = url.trim();

  if (!value) {
    return ErrorCode.REQUIRED;
  }

  if (feeds.some((feed) => feed.url === value)) {
    return ErrorCode.DUPLICATE;
  }

  const isValidUrl = await urlSchema.isValid(value);

  return isValidUrl ? null : ErrorCode.INVALID_URL;
};
