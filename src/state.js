import { proxy } from 'valtio/vanilla';

export const FormStatus = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
});

export const createStore = () => proxy({
  form: {
    status: FormStatus.IDLE,
    error: null,
  },
  feeds: [],
  posts: [],
});
