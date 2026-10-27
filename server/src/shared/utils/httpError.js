// A small helper for sending errors in the one shape every API uses:
// { error: { code, message } }. Route code throws an HttpError and
// middleware/errorHandler.js turns it into the JSON response.

export class HttpError extends Error {
  // status: HTTP status number, code: short UPPER_CASE id, message: text for people.
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Read ?page=&limit= from a request and return safe numbers plus how many to skip.
export function readPagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}
