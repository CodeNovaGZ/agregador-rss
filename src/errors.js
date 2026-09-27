export const ErrorCode = Object.freeze({
  REQUIRED: 'required',
  INVALID_URL: 'invalidUrl',
  DUPLICATE: 'duplicate',
  UNPARSABLE: 'unparsable',
  NETWORK: 'network',
  UNKNOWN: 'unknown',
});

export class AppError extends Error {
  constructor(code) {
    super(code);
    this.name = 'AppError';
    this.code = code;
  }
}
