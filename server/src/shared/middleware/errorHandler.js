// Sends every error back in the same shape.
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';

export function notFound(req, _res, next) {
  next(new HttpError(404, 'NOT_FOUND', `No API route for ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const message = `${first.path.join('.') || 'input'}: ${first.message}`;
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message } });
  }
  console.error('[error]', err);
  return res
    .status(500)
    .json({ error: { code: 'SERVER_ERROR', message: 'Something went wrong. Try again.' } });
}
