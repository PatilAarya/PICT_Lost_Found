// The last middleware in app.js. Any error thrown in a route ends up here and is
// sent back as { error: { code, message } }. Express 5 forwards errors from async
// routes automatically, so routes can simply `throw`.
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';

// Send a request for an unknown /api path to the error handler as a 404.
export function notFound(req, _res, next) {
  next(new HttpError(404, 'NOT_FOUND', `No API route for ${req.method} ${req.originalUrl}`));
}

// Turn any error into the standard JSON error shape.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  if (err instanceof ZodError) {
    // Zod lists every invalid field; we show the first one in plain words.
    const first = err.issues[0];
    const message = `${first.path.join('.') || 'input'}: ${first.message}`;
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message } });
  }
  console.error('[error]', err);
  return res
    .status(500)
    .json({ error: { code: 'SERVER_ERROR', message: 'Something went wrong. Try again.' } });
}
