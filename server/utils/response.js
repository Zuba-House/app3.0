export function sendSuccess(res, statusCode, message, data) {
  const payload = {
    success: true,
    message: message || 'OK',
  };
  if (data !== undefined) payload.data = data;
  return res.status(statusCode).json(payload);
}

export function sendError(res, statusCode, message, error) {
  const payload = {
    success: false,
    message: message || 'Request failed',
  };
  if (error !== undefined) payload.error = error;
  return res.status(statusCode).json(payload);
}

