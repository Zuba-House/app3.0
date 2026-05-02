const isPlainObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

const EXCLUDED_DATA_KEYS = new Set([
  'success',
  'error',
  'message',
  'details',
  'stack',
]);

function extractData(body) {
  if (body.data !== undefined) return body.data;
  const rest = {};
  Object.keys(body).forEach((key) => {
    if (!EXCLUDED_DATA_KEYS.has(key)) {
      rest[key] = body[key];
    }
  });
  return Object.keys(rest).length > 0 ? rest : undefined;
}

function extractError(body) {
  if (body.error && body.error !== true) return body.error;
  if (body.details !== undefined) return body.details;
  if (body.stack !== undefined) return { stack: body.stack };
  return undefined;
}

export default function responseNormalizer(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (!isPlainObject(body)) {
      return originalJson(body);
    }

    const hasLegacyShape =
      Object.prototype.hasOwnProperty.call(body, 'success') ||
      Object.prototype.hasOwnProperty.call(body, 'error') ||
      Object.prototype.hasOwnProperty.call(body, 'message');

    if (!hasLegacyShape) {
      return originalJson(body);
    }

    const success =
      typeof body.success === 'boolean'
        ? body.success
        : body.error === true
          ? false
          : true;

    const message =
      typeof body.message === 'string' && body.message.trim()
        ? body.message
        : success
          ? 'OK'
          : 'Request failed';

    const normalized = {
      success,
      message,
    };

    const data = extractData(body);
    if (data !== undefined) {
      normalized.data = data;
    }

    if (!success) {
      const error = extractError(body);
      if (error !== undefined) {
        normalized.error = error;
      }
    }

    return originalJson(normalized);
  };

  next();
}

