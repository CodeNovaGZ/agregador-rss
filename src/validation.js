import * as yup from 'yup';

yup.setLocale({
  mixed: {
    required: 'errors.required',
  },
  string: {
    url: 'errors.url',
  },
});

const createSchema = (feeds) => {
  return yup
    .string()
    .required()
    .url()
    .test(
      'unique',
      'errors.duplicate',
      (value) => !feeds.some((feed) => feed.url === value),
    );
};

export const validation = (url, feeds) => {
  const schema = createSchema(feeds);
  return schema.validate(url);
};